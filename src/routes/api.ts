import { Hono } from "hono";
import ChatApi from "./api/chat_api";
import SessionApi from "./api/session_api";
import { createNodeWebSocket } from "@hono/node-ws";
const app = new Hono()

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

app.route('/session', SessionApi);
app.route('/chat', ChatApi);

app.get('/ws', upgradeWebSocket(async (c) => {
    return {
        onOpen(evt, ws) {
            ws.send("Server connected")
        },
    }
}))

export { injectWebSocket }

export default app;