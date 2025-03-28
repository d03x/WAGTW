import { Hono } from "hono";
import { serve } from "@hono/node-server"
import { cors } from "hono/cors";
import api, { injectWebSocket } from "./routes/api";
import { logger } from "hono/logger";
import "./utils/global";
import { factory } from "./utils/server";
import { sessionApi } from "./routes/session-api";
import { hc } from "hono/client";
const app = factory.createApp()
//create app
app.use(cors({ origin: "*" }))
app.use(logger())
export const apiRoutes = app.basePath("/api")
apiRoutes.route('session', sessionApi)
const server = serve(app, () => {
    console.log("Server berjalan")
})
injectWebSocket(server)
