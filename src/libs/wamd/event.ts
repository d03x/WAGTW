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

export {
    ON_PAIRING_CODE,
    ON_CONNECTION_CLOSE,
    ON_QR_CODE,
    ON_CONNECTION_OPEN
}