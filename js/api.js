/* Optional same-origin API client. Local browser gameplay keeps working when the API is offline. */
(function () {
  "use strict";

  const base = String(window.BETVORA_API_BASE || "/api").replace(/\/+$/, "");
  let registry = null;
  let currentGame = null;
  let currentSession = null;
  let startPromise = null;
  let generation = 0;

  async function request(path, options) {
    const response = await fetch(base + path, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { "content-type": "application/json", ...(options && options.headers || {}) },
      ...options
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `API request failed (${response.status}).`);
    return payload;
  }

  async function refreshGames() {
    try {
      const result = await request("/games", { method: "GET", headers: {} });
      registry = new Map((result.games || []).map((game) => [game.id, game]));
      return result.games || [];
    } catch {
      registry = null;
      return [];
    }
  }

  function isGameEnabled(gameId) {
    if (!registry) return true;
    const game = registry.get(gameId);
    return !game || game.status === "active";
  }

  function startSession(gameId) {
    currentGame = gameId;
    currentSession = null;
    const requestId = ++generation;
    startPromise = request("/sessions", {
      method: "POST",
      body: JSON.stringify({ gameId })
    }).then((result) => {
      if (requestId === generation) currentSession = result.sessionId;
      return requestId === generation ? result.sessionId : null;
    }).catch(() => null);
    return startPromise;
  }

  async function record(eventType, details) {
    const data = details || {};
    const gameId = data.gameId || currentGame;
    if (!gameId) return false;
    if (gameId !== currentGame || !startPromise) await startSession(gameId);
    else if (!currentSession) await startPromise;
    if (!currentSession || gameId !== currentGame) return false;
    try {
      await request(`/sessions/${encodeURIComponent(currentSession)}/events`, {
        method: "POST",
        body: JSON.stringify({ eventType, gameId, ...data })
      });
      return true;
    } catch {
      return false;
    }
  }

  window.BetvoraAPI = Object.freeze({
    refreshGames,
    isGameEnabled,
    startSession,
    record,
    get mode() { return "virtual-coin-practice"; }
  });

  refreshGames();
})();

