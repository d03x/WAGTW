import { auth } from "@/middleware/auth";
import { factory } from "@/utils/server";
import { createToken } from "@/utils/zod/create-token";
import type { JwtPayloadType } from "@/utils/zod/jwt";
import { startSessionSchema } from "@/utils/zod/start-sesion";
import { zValidator } from "@hono/zod-validator"
import jwt from "jsonwebtoken"
const sessionApi = factory.createApp()

sessionApi.post('/create-token', zValidator('json', createToken), async (c) => {
    const userData = c.req.valid("json");
    if (userData.server_token != c.var.SERVER_SECRET_CODE) {
        return c.json({
            success: false,
            message: "Server token is invalid"
        }, 422)
    }
    const paylaod: JwtPayloadType = {
        session: userData.session_name,
        exp: Date.now() * (3600 * 24 * 30 * 10)
    }

    const token = jwt.sign(paylaod, c.var.JWT_SECRET)

    return c.json({
        token,
        status: true,
        message: "Token Created"
    }, 201)
})
//function for start session
sessionApi.post('/start', auth(), zValidator("json", startSessionSchema), (c) => {
    return c.json(c.var.payload)
})

export {
    sessionApi
}