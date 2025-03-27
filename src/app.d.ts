import type { WaMDClient } from "./libs/wamd/client/WaMdClient"

declare global {
    var sessions: Map,
        addWaSession: (name: string, session: WaMDClient) => void,
        getWaSession: (name: string) => WaMDClient,
        removeWaSession: (name: string) => boolean

}

export { }