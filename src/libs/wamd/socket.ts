import type { Boom } from "@hapi/boom";
import { makeWASocket, delay, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState, type WASocket } from "baileys";
import { existsSync, mkdir, mkdirSync, readdirSync, rmdirSync, rmSync } from "fs";
import path from "path";
import P from "pino";
import fs from "fs-extra"
import { addSession, getSession } from "./sessions";
import type { WaMdOptions } from "./types/socket";
import NodeCache from "@cacheable/node-cache";
import { WaMDClient } from "./client/WaMdClient";
import { emiter } from "@/utils/emiter";
const loger = P({ timestamp() { return `time:"${new Date().toJSON()}"` }, }, P.destination('./WaMd.log.txt'))
loger.level = "silent";
const msgRetryCounterCache = new NodeCache()
const callbacks = new Map<string, (param: any) => any>()
class WaMD {
    public SESSION_DIRECTORY = "wa_sessions";
    public SESSION_PREFIX = "hdytdev";
    /**
     * getSessionPath
     */
    public getSessionDirectory() {
        const folder = path.resolve(this.SESSION_DIRECTORY);
        if (!existsSync(folder)) {
            mkdirSync(folder)
        }
        return folder;
    }

    /**
     * newSession
     */
    public checkSessionAvailable(name: string) {
        const folder = this.genereateSessionFolder(name);
        const $session = globalThis.getWaSession(name);
        if (existsSync(folder) && readdirSync(folder).length && existsSync(this.getSessionDirectory()) && $session) {
            return true;
        }
        return false;
    }

    public genereateSessionFolder(name: string) {
        const sessionDirectory = this.getSessionDirectory();
        return path.join(sessionDirectory, `${this.SESSION_PREFIX}${name}`)
    }

    public newSession(session: string, options?: WaMdOptions) {
        const sessionCheckAvailable = this.checkSessionAvailable(session);
        if (sessionCheckAvailable) {
            console.log("Session available")
        } else {
            const startSocket = async () => {
                const version = await fetchLatestBaileysVersion()
                const { saveCreds, state } = await useMultiFileAuthState(this.genereateSessionFolder(session));
                const sock: WASocket = makeWASocket({
                    printQRInTerminal: !options?.usePairingCode,
                    version: version.version,
                    logger: loger,
                    msgRetryCounterCache,
                    auth: {
                        creds: state.creds,
                        keys: makeCacheableSignalKeyStore(state.keys, P())
                    }
                })
                if (options?.usePairingCode && !sock.authState.creds.registered) {
                    const number = options.phoneNumber.trim()
                    await delay(2000)
                    const code = await sock.requestPairingCode(number)
                    emiter.emit(`PAIRING_${session}_CODE`, { code, session });
                }
                globalThis.addWaSession(session, new WaMDClient(sock))
                //handle connection update
                sock.ev.on("connection.update", (event) => {
                    const { connection, qr, lastDisconnect } = event;

                    if (qr) {
                        emiter.emit(`QR_${session}_CODE`, {
                            session,
                            qr,
                        });
                    }
                    if (connection === 'open') {
                        emiter.emit(`CONNECTION_OPEN_${session}`, true);
                    }
                    if (connection === 'close') {
                        if ((lastDisconnect?.error as Boom).output.statusCode != DisconnectReason.loggedOut) {
                            startSocket()
                        } else {
                            fs.removeSync((this.genereateSessionFolder(session)))
                            console.log('Connection closed. You are logged out.')
                        }
                    }
                })
                //handle credential update
                sock.ev.on("creds.update", async () => {
                    await saveCreds()
                })
                //on message
                sock.ev.on("messages.upsert", (event) => {
                    console.log(event)
                })
            }
            const sock = startSocket()
            return sock;
        }
    }


}

export default WaMD;