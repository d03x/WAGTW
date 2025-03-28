import { jidNormalizedUser, type AnyMessageContent, type BaileysEventMap, type MessageUpsertType, type WAMessage, type WASocket } from "baileys";

export class WaMDClient {
    public _client?: WASocket;
    constructor(client: WASocket) {
        this._client = client;
    }
    public client() {
        return this._client;
    }
    public event<T extends keyof BaileysEventMap>(name: T, callback: (args: BaileysEventMap[T]) => void) {
        return this.client()?.ev.on(name, callback);
    }
    public baseSend(toJId: string, msg: AnyMessageContent) {
        return this._client?.sendMessage(this.toJId(toJId), msg)
    }

    private toJId(jid: string): string {
        return jidNormalizedUser(`${jid}@s.whatsapp.net`)
    }

    /**
     * getContacts
     */
    public async getBlockLists() {
        return await this._client?.fetchBlocklist()
    }

    public sendImage(sender: string, url: string, caption?: string) {
        return this.baseSend(sender, {
            image: { url },
            caption,
        })
    }
    public sendTextMessage(sender: string, text: string) {
        return this.baseSend(sender, {
            text: text,
        })
    }

}