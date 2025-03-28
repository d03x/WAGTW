import type { Boom } from "@hapi/boom";
import {
    makeWASocket,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    type WASocket,
} from "baileys";
import {
    existsSync,
    mkdir,
    mkdirSync,
    promises,
    readdirSync,
    rmdirSync,
    rmSync,
    unlinkSync,
} from "fs";
import path from "path";
import P from "pino";
import fs from "fs-extra";
import { addSession, getSession } from "./sessions";
import type { WaMdOptions } from "./types/socket";
import NodeCache from "@cacheable/node-cache";
import { WaMDClient } from "./client/WaMdClient";
import { emiter } from "@/utils/emiter";
import {
    ON_CONNECTION_CLOSD,
    ON_CONNECTION_CLOSE,
    ON_CONNECTION_OPEN,
    ON_PAIRING_CODE,
    ON_QR_CODE,
    ON_SESSION_LOG,
    SESSION_ALERDY_START,
} from "./event";
import { promise } from "zod";
const loger = P(
    {
        timestamp() {
            return `time:"${new Date().toJSON()}"`;
        },
    },
    P.destination("./WaMd.log.txt")
);
loger.level = "silent";
const msgRetryCounterCache = new NodeCache();
const callbacks = new Map<string, (param: any) => any>();
class WaMD {
    public SESSION_DIRECTORY = "wa_sessions";
    public SESSION_PREFIX = "hdytdev";
    /**
     * getSessionPath
     */
    public getSessionDirectory() {
        const folder = path.resolve(this.SESSION_DIRECTORY);
        if (!existsSync(folder)) {
            mkdirSync(folder);
        }
        return folder;
    }
    /**
     * logout
     */
    public logout(session: string) {
        if (this.checkSessionAvailable(session)) {
            const folder = this.getSessionClientFolder(session);
            const client = globalThis.getWaSession(session);
            client._client?.logout();
            globalThis.removeWaSession(session);
            unlinkSync(folder);
        }
    }
    /**
     * newSession
     */
    public checkSessionAvailable(name: string) {
        const folder = this.getSessionClientFolder(name);
        const $session = globalThis.getWaSession(name);
        if (
            existsSync(folder) &&
            readdirSync(folder).length &&
            existsSync(this.getSessionDirectory()) &&
            $session
        ) {
            return true;
        }
        return false;
    }

    public getSessionClientFolder(name: string) {
        const sessionDirectory = this.getSessionDirectory();
        return path.join(sessionDirectory, `${this.SESSION_PREFIX}${name}`);
    }
    //new session
    public async newSession(session: string, options?: WaMdOptions) {
        const sessionCheckAvailable = this.checkSessionAvailable(session);
        if (sessionCheckAvailable) {
            emiter.emit(SESSION_ALERDY_START(session), true)
        } else {
            const startSocket = async () => {
                const { version, error } = await fetchLatestBaileysVersion();
                const { saveCreds, state } = await useMultiFileAuthState(
                    this.getSessionClientFolder(session)
                );
                if (error) {
                    console.error(error, "Check your internet");
                    emiter.emit(ON_SESSION_LOG(session), {
                        log: error,
                    })
                }
                const sock: WASocket = makeWASocket({
                    printQRInTerminal: !options?.usePairingCode,
                    version: version,
                    logger: loger,
                    msgRetryCounterCache,
                    auth: {
                        creds: state.creds,
                        keys: makeCacheableSignalKeyStore(state.keys, loger),
                    },
                });
                if (options?.usePairingCode && !sock.authState.creds.registered) {
                    const number = options.phoneNumber.trim();
                    await delay(2000);
                    const code = await sock.requestPairingCode(number);
                    emiter.emit(ON_PAIRING_CODE(session), { code, session });
                }
                globalThis.addWaSession(session, new WaMDClient(sock));
                //handle connection update
                sock.ev.on("connection.update", (event) => {
                    const { connection, qr, lastDisconnect } = event;

                    if (qr) {
                        emiter.emit(ON_QR_CODE(session), {
                            session,
                            qr,
                        });
                    }
                    if (connection === "open") {
                        emiter.emit(ON_CONNECTION_OPEN(session), true);
                    }
                    if (connection === "close") {
                        const error = lastDisconnect?.error as Boom;
                        const shouldReconnect =
                            error.output.statusCode != DisconnectReason.loggedOut;
                        if (shouldReconnect) {
                            const errorType = error.output.payload.error;
                            if (errorType == "Unauthorized" || errorType == "Method Not Allowed") {
                                this.clearAuthState(session);
                            }
                            startSocket();
                        } else {
                            this.logout(session);
                            emiter.emit(ON_CONNECTION_CLOSE(session));
                        }
                    }
                    emiter.emit(ON_SESSION_LOG(session), {
                        log: event,
                    })
                });
                //handle credential update
                sock.ev.on("creds.update", async (c) => {
                    await saveCreds();
                });
                //on message
                sock.ev.on("messages.upsert", (event) => {
                    console.log(event);
                });
                return sock;
            };
            try {
                return await startSocket();
            } catch (error: any) {
                emiter.emit(ON_CONNECTION_CLOSD(), "Conenction Close");
            }
        }
    }
    async clearAuthState(session?: string) {
        if (session) {
            await promises.rmdir(this.getSessionClientFolder(session), {
                recursive: true,
            });
        } else {
            await promises.rmdir(this.getSessionDirectory(), { recursive: true });
        }
    }
}

export default WaMD;
