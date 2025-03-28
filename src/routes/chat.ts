import { auth } from "@/middleware/auth";
import { factory } from "@/utils/server";

const chatApi = factory.createApp()

chatApi.get("/get-group-contact/:test", auth(), async function (e) {
    const client = globalThis.getWaSession(e.var.payload.session)
    const whatsaap = await client.client()?.updateProfileName(JSON.stringify(e.req.param("test")))
    const ss = await client.client()?.updateProfileStatus(JSON.stringify(e.req.param("test")))
    return e.json([
        "Updated"
    ])
})

export default chatApi;