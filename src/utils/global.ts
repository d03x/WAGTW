globalThis.sessions = new Map()


globalThis.addWaSession = (name, session) => {
    globalThis.sessions.set(name, session);
}

globalThis.getWaSession = (name) => {
    return globalThis.sessions.get(name);
}
globalThis.removeWaSession = (name) => {
    globalThis.sessions.set(name, null);
    delete globalThis.sessions[name]
    return true;
}