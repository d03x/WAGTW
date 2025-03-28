import { test } from "bun:test";
import { whatsapp } from "../wamd";
import { emiter } from "@/utils/emiter";
import { ON_QR_CODE } from "../event";
import "@/utils/global"
const name = 'TestWhatsapp'
await whatsapp.newSession(name);

globalThis.getWaSession(name).event("connection.update", (e) => {
    console.log(`QRCODE: ` + e.qr);
})

emiter.on(ON_QR_CODE(name), (qr) => {
    console.log(qr);
})