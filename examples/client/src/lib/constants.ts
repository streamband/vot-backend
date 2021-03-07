export const VSN: string = '1.0.0'

export const DEFAULT_TIMEOUT = 10000

export const WS_CLOSE_NORMAL = 1000

export enum SOCKET_STATES {
  connecting = 0,
  open = 1,
  closing = 2,
  closed = 3,
}

export enum TRANSPORTS {
  websocket = 'websocket',
}
