import axios from "axios";

const GAME_API_URL = String(process.env.GAME_API_URL || "http://127.0.0.1:7126").replace(/\/$/, "");

async function request(method, path, data = undefined, token = undefined) {
  try {
    const response = await axios({ method, url: `${GAME_API_URL}${path}`, data, timeout: 7000, headers: token ? { "x-player-token": token } : undefined });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || "Game Server tidak dapat dihubungi.";
    const e = new Error(message); e.code = error.response?.data?.error || "GAME_API_ERROR"; e.status = error.response?.status || 503; throw e;
  }
}

export const gameApi = {
  baseUrl: GAME_API_URL,
  health: () => request("GET", "/api/v1/health"),
  createPlayer: (externalId, name) => request("POST", "/api/v1/players", { externalId, name }),
  createTttRoom: (playerId, token) => request("POST", "/api/v1/ttt/rooms", { gameId: "ttt", playerId }, token),
  joinTttRoom: (roomId, playerId, token) => request("POST", `/api/v1/ttt/rooms/${encodeURIComponent(roomId)}/join`, { playerId }, token),
  getTttRoom: roomId => request("GET", `/api/v1/ttt/rooms/${encodeURIComponent(roomId)}`),
  moveTtt: (roomId, playerId, position, token) => request("POST", `/api/v1/ttt/rooms/${encodeURIComponent(roomId)}/move`, { playerId, position }, token),
  leaveTtt: (roomId, playerId, token) => request("POST", `/api/v1/ttt/rooms/${encodeURIComponent(roomId)}/leave`, { playerId }, token)
};
