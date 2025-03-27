import { Hono } from "hono";
import { serve } from "@hono/node-server"
import { cors } from "hono/cors";
import api, { injectWebSocket } from "./routes/api";
import { logger } from "hono/logger";
import "./utils/global";
const app = new Hono()
app.use(cors({ origin: "*" }))
app.use(logger())
app.route('/api', api);

const server = serve(app, () => {
    console.log("Server berjalan")
})
injectWebSocket(server)
