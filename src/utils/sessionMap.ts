import type { WASocket } from "baileys"

const sessionMap = new Map<String, WASocket>


const addSesion = (name: string, session: WASocket) => {
    if (!sessionMap.get(name)) {
        return sessionMap.set(name, session)
    }
    return sessionMap.get(name)
}

const getSession = (name: string): WASocket => {
    return sessionMap.get(name) as WASocket;
}

export {
    addSesion,
    getSession
}