import { Hono } from "hono";

const ChatApi = new Hono()

ChatApi.get("send-chat", (c) => {

    console.log(globalThis.getWaSession('djaqi'))

    return c.json(['ok'])
})

export default ChatApi;