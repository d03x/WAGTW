import { jidNormalizedUser, type AnyMessageContent, type MessageUpsertType, type WAMessage, type WASocket } from "baileys";

export class WaMDClient {
    public _client?: WASocket;
    constructor(client: WASocket) {
        this._client = client;
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