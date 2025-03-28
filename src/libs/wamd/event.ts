const ON_QR_CODE = (session_name: string) => {
    return `ON_QR_CODE_${session_name}`;
}

const ON_CONNECTION_OPEN = (session_name: string) => {
    return `ON_CONNECTION_OPEN_${session_name}`;
}

const ON_CONNECTION_CLOSE = (session_name: string) => {
    return `ON_CONNECTION_CLOSE_${session_name}`;
}
const ON_PAIRING_CODE = (session_name: string) => {
    return `ON_PAIRING_CODE${session_name}`;
}
const ON_CONNECTION_CLOSD = () => {
    return `ON_CONNECTION_CLOSED`;
}
const SESSION_ALERDY_START = (session_name: string) => {
    return `SESSION_ALERDY_START_${session_name}`;
}

const ON_SESSION_LOG = (session_name: string) => {
    return `ON_SESSION_LOG_${session_name}`
}

export {
    SESSION_ALERDY_START,
    ON_SESSION_LOG,
    ON_CONNECTION_CLOSD,
    ON_PAIRING_CODE,
    ON_CONNECTION_CLOSE,
    ON_QR_CODE,
    ON_CONNECTION_OPEN
}