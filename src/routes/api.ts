import { Hono } from "hono";
import ChatApi from "./api/chat_api";
import SessionApi from "./api/session_api";
const api = new Hono()
api.route('/session', SessionApi);
api.route('/chat', ChatApi);
export default api;