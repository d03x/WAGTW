import { serve } from "@hono/node-server"
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "./utils/global";
import { factory } from "./utils/server";
import { sessionApi } from "./routes/session-api";
import { createNodeWebSocket } from "@hono/node-ws";
import { emiter } from "./utils/emiter";
import { auth } from "./middleware/auth";
import type { JwtPayloadType } from "./utils/zod/jwt";
import { ON_CONNECTION_CLOSD, ON_PAIRING_CODE, ON_QR_CODE } from "./libs/wamd/event";
import chatApi from "./routes/chat";
const app = factory.createApp()

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
    app: app
})

//create app
app.use(cors({ origin: "*" }))
app.use(logger())
export const apiRoutes = app.basePath("/api")
apiRoutes.route('session', sessionApi)
apiRoutes.route('chat', chatApi);
app.get('/ws', auth(), upgradeWebSocket(async (c) => {

    const paylod = c.var.payload as JwtPayloadType;
    console.log(paylod);

    return {
        onOpen(evt, ws) {
            emiter.on(ON_PAIRING_CODE(paylod.session), e => {
                ws.send(JSON.stringify(e))
            })
            emiter.on(ON_QR_CODE(paylod.session), (cd) => {
                ws.send(JSON.stringify(cd))
            })
            emiter.on(ON_CONNECTION_CLOSD(), (e) => {
                ws.send(JSON.stringify(e))
            })
        },
        onMessage(evt, ws) {
            ws.send("OKE BROW")
        },
        onClose(evt, ws) {
            ws.send(JSON.stringify({
                event: "WS_CLOSE"
            }))
        },
    }
}))

const server = serve(app, () => {
    console.log("Server berjalan")
})
injectWebSocket(server)
