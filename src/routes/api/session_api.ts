import { whatsapp } from "@/libs/wamd/wamd";
import { emiter } from "@/utils/emiter";
import { Hono } from "hono";
const SessionApi = new Hono();

SessionApi.post('new-token', (c) => {
    return c.body("234324")
})

SessionApi.post('start', async function (c) {
    let body = await c.req.json()
    const sessionName = body?.session_name

    if (!sessionName) {
        return c.json({
            'message': "SEssion name not found",
        }, 422)
    }

    await whatsapp.newSession(sessionName);
    const pairingCode = emiter.on(`PAIRING_${sessionName}_CODE`, (code) => {
        console.log(code);
        return code;
    })
    return c.json({
        pairingCode,
    })
})

export default SessionApi;
