import { whatsapp } from "@/libs/wamd/wamd";
import { emiter } from "@/utils/emiter";
import { Hono } from "hono";
const SessionApi = new Hono();

SessionApi.post('start', async function (c) {
    let body = await c.req.json()
    const sessionName = body?.session_name
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
