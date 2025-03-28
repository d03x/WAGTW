import { whatsapp } from "@/libs/wamd/wamd";
import { auth } from "@/middleware/auth";
import { emiter } from "@/utils/emiter";
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

    emiter.emit('sock', 234)

    return c.json({
        token,
        status: true,
        message: "Token Created"
    }, 201)
})
//function for start session
sessionApi.post('/start', auth(), zValidator("json", startSessionSchema), (c) => {
    const valid = c.req.valid('json');
    const $session = whatsapp.checkSessionAvailable(c.var.payload.session);
    if ($session) {
        return c.json({
            message: "Session Alerdy Exists"
        });
    }
    try {
        whatsapp.newSession(c.var.payload.session, {
            phoneNumber: valid.phone,
            usePairingCode: true
        })
    } catch (error) {
        console.log(error);
    }
    return c.json(c.var.payload)
})

export {
    sessionApi
}