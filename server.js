"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_SESSIONS = 5000;
const MAX_EVENTS_PER_SESSION = 100;
const MAX_BODY_BYTES = 8192;
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "api", "games.json"), "utf8"));
const games = new Map(registry.games.map((game) => [game.id, game]));
const sessions = new Map();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(body);
}

function pruneSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [id, session] of sessions) {
    if (session.updatedAt < cutoff) sessions.delete(id);
  }
  while (sessions.size >= MAX_SESSIONS) {
    const oldest = sessions.keys().next().value;
    if (!oldest) break;
    sessions.delete(oldest);
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request body is too large."), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON."), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function validAmount(value) {
  return Number.isFinite(value) && value >= 0 && value <= 100000000;
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, service: "betvora-api-gateway", mode: registry.mode });
  }

  if (req.method === "GET" && url.pathname === "/api/games") {
    return sendJson(res, 200, registry);
  }

  const configMatch = url.pathname.match(/^\/api\/games\/([a-z0-9-]+)\/config$/);
  if (req.method === "GET" && configMatch) {
    const game = games.get(configMatch[1]);
    if (!game) return sendJson(res, 404, { error: "Unknown game." });
    return sendJson(res, 200, { ...game, mode: registry.mode, currency: registry.currency, redeemable: false });
  }

  if (req.method === "POST" && url.pathname === "/api/sessions") {
    const body = await readJson(req);
    const game = games.get(String(body.gameId || ""));
    if (!game || game.status !== "active") return sendJson(res, 404, { error: "Game is unavailable." });
    pruneSessions();
    const now = new Date().toISOString();
    const session = {
      id: randomUUID(),
      gameId: game.id,
      mode: registry.mode,
      currency: registry.currency,
      redeemable: false,
      createdAt: now,
      updatedAt: Date.now(),
      events: []
    };
    sessions.set(session.id, session);
    return sendJson(res, 201, {
      sessionId: session.id,
      gameId: session.gameId,
      mode: session.mode,
      currency: session.currency,
      redeemable: false,
      createdAt: session.createdAt
    });
  }

  const sessionMatch = url.pathname.match(/^\/api\/sessions\/([0-9a-f-]+)$/i);
  if (req.method === "GET" && sessionMatch) {
    const session = sessions.get(sessionMatch[1]);
    if (!session) return sendJson(res, 404, { error: "Practice session not found or expired." });
    return sendJson(res, 200, {
      sessionId: session.id,
      gameId: session.gameId,
      mode: session.mode,
      currency: session.currency,
      redeemable: false,
      createdAt: session.createdAt,
      eventCount: session.events.length
    });
  }

  const eventsMatch = url.pathname.match(/^\/api\/sessions\/([0-9a-f-]+)\/events$/i);
  if (req.method === "POST" && eventsMatch) {
    const session = sessions.get(eventsMatch[1]);
    if (!session) return sendJson(res, 404, { error: "Practice session not found or expired." });
    const body = await readJson(req);
    const allowedTypes = new Set(["round_started", "round_settled"]);
    if (body.gameId !== session.gameId || !allowedTypes.has(body.eventType)) {
      return sendJson(res, 400, { error: "Invalid practice event." });
    }
    const event = { type: body.eventType, at: new Date().toISOString() };
    if (body.eventType === "round_started") {
      if (!validAmount(body.stakeVC) || body.stakeVC <= 0) return sendJson(res, 400, { error: "Invalid virtual-coin stake." });
      event.stakeVC = Math.round(body.stakeVC * 100) / 100;
    } else {
      if (!validAmount(body.stakeVC) || !validAmount(body.payoutVC) || !Number.isFinite(body.multiplier) || body.multiplier < 0 || body.multiplier > 1000000) {
        return sendJson(res, 400, { error: "Invalid practice result." });
      }
      event.stakeVC = Math.round(body.stakeVC * 100) / 100;
      event.payoutVC = Math.round(body.payoutVC * 100) / 100;
      event.multiplier = Math.round(body.multiplier * 10000) / 10000;
    }
    session.events.push(event);
    if (session.events.length > MAX_EVENTS_PER_SESSION) session.events.shift();
    session.updatedAt = Date.now();
    return sendJson(res, 202, { accepted: true, practiceOnly: true, redeemable: false });
  }

  return sendJson(res, 404, { error: "API route not found." });
}

function serveStatic(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" });
    return res.end();
  }
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return sendJson(res, 400, { error: "Invalid URL path." });
  }
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) return sendJson(res, 403, { error: "Forbidden." });
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) return sendJson(res, 404, { error: "Not found." });
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "content-type": contentType,
      "content-length": stat.size,
      "x-content-type-options": "nosniff",
      "cache-control": "no-cache"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch((error) => {
      if (!res.headersSent) sendJson(res, error.status || 500, { error: error.status ? error.message : "Internal server error." });
      else res.destroy();
    });
    return;
  }
  serveStatic(req, res, url);
});

server.listen(PORT, HOST, () => {
  console.log(`Betvora practice server listening at http://${HOST}:${PORT}`);
});

