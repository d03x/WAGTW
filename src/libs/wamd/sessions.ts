import type { WASocket } from "baileys";
import type { WaMDClient } from "./client/WaMdClient";

var sessionMaps = new Map<string, WaMDClient>()

export const addSession = (name: string, session: WaMDClient) => {
    sessionMaps.set(name, session);
}

export const getSession = (name: string): WaMDClient => {
    return sessionMaps.get(name) as WaMDClient;
}