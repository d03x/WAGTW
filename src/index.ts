import { Hono } from "hono";
import { serve } from "@hono/node-server"
import { cors } from "hono/cors";
import api from "./routes/api";
import { logger } from "hono/logger";
import "./utils/global";
import { createNodeWebSocket } from "@hono/node-ws";
import { emiter } from "./utils/emiter";
const app = new Hono()
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })
app.use(cors({ origin: "*" }))
app.use(logger())

app.route('/api', api);
app.get('/api', upgradeWebSocket(async function (c) {
    return {
        async onOpen(event, ws) {
            ws.send("Server on")
        },
        async onMessage(event, ws) {
            const command = JSON.parse(event.data as any);
            const device = command.DEVICE_ID;
            if (command.ACTION == "GET_QR_CODE") {
                emiter.on(`CONNECTION_OPEN_${device}`, (e) => {
                    ws.send(JSON.stringify({
                        type: "WA_CONNECTED",
                    }))
                })
                emiter.on(`QR_${device}_CODE`, function (e) {
                    if (e.session === device) {
                        ws.send(JSON.stringify({
                            type: "QRCODE",
                            qrcode: e.qr,
                        }))
                    }
                })
            }

            ws.send("BAKA")
        },
        async onClose(evt, ws) {
            console.log("Server close");

        },
    }
}));
const server = serve(app, () => {
    console.log("Server berjalan")
})
injectWebSocket(server)
