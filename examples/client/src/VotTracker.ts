import {
  VSN,
  TRANSPORTS,
  SOCKET_STATES,
  DEFAULT_TIMEOUT,
  WS_CLOSE_NORMAL,
} from './lib/constants'
import querystring from 'query-string'
import Timer from './lib/timer'
import { w3cwebsocket as WebSocket } from 'websocket'
import platform from 'platform'

type Options = {
  transport?: WebSocket
  timeout?: number
  heartbeatIntervalMs?: number
  longpollerTimeout?: number
  logger?: Function
  encode?: Function
  decode?: Function
  reconnectAfterMs?: Function
  headers?: { [key: string]: string }
  params?: { [key: string]: string }
}
type Message = {
  topic: string
  event: string
  payload: any
  ref: string
}
type InitParams = {
  html_video_element_id: string,
  video_id?: string,
  video_name?: string,
  video_type?: string // live/vod
  category_name?: string,
  sub_category_name?: string
}


const noop = () => {}

export default class VotTracker {
  channels: any[] = []
  endPoint: string = ''
  headers?: { [key: string]: string } = {}
  params?: { [key: string]: string } = {}
  timeout: number = DEFAULT_TIMEOUT
  transport: any = WebSocket
  heartbeatIntervalMs: number = 30000
  longpollerTimeout: number = 20000
  heartbeatTimer: number | undefined = undefined
  pendingHeartbeatRef: string | null = null
  ref: number = 0
  reconnectTimer: Timer
  logger: Function = noop
  encode: Function
  decode: Function
  reconnectAfterMs: Function
  conn: WebSocket | null = null
  sendBuffer: Function[] = []
  stateChangeCallbacks: {
    open: Function[]
    close: Function[]
    error: Function[]
    message: Function[]
  } = {
    open: [],
    close: [],
    error: [],
    message: [],
  }

  /**
   * Initializes the Socket
   *
   * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
   * @param options.transport The Websocket Transport, for example WebSocket.
   * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
   * @param options.params The optional params to pass when connecting.
   * @param options.headers The optional headers to pass when connecting.
   * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
   * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
   * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
   * @param options.decode The function to decode incoming messages. Defaults to JSON: (payload, callback) => callback(JSON.parse(payload))
   * @param options.longpollerTimeout The maximum timeout of a long poll AJAX request. Defaults to 20s (double the server long poll timer).
   * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
   */
  constructor(endPoint: string, options?: Options) {
    this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`

    if (options?.params) this.params = options.params
    if (options?.headers) this.headers = options.headers
    if (options?.timeout) this.timeout = options.timeout
    if (options?.logger) this.logger = options.logger
    if (options?.transport) this.transport = options.transport
    if (options?.heartbeatIntervalMs)
      this.heartbeatIntervalMs = options.heartbeatIntervalMs
    if (options?.longpollerTimeout)
      this.longpollerTimeout = options.longpollerTimeout

    this.reconnectAfterMs = options?.reconnectAfterMs
      ? options.reconnectAfterMs
      : (tries: number) => {
          return [1000, 2000, 5000, 10000][tries - 1] || 10000
        }
    this.encode = options?.encode
      ? options.encode
      : (payload: JSON, callback: Function) => {
          return callback(JSON.stringify(payload))
        }
    this.decode = options?.decode
      ? options.decode
      : (payload: string, callback: Function) => {
          return callback(JSON.parse(payload))
        }
    // TODO: with it with heart
    this.reconnectTimer = new Timer(async () => {
      // await this.disconnect()
      // this.connect()
    }, this.reconnectAfterMs)
  }

  /**
   * Connects the socket.
   */
  connect() {
    if (this.conn) {
      return
    }

    this.conn = new this.transport(this.endPointURL(), [], null, this.headers)
    if (this.conn) {
      // this.conn.timeout = this.longpollerTimeout // TYPE ERROR
      this.conn.onopen = () => this._onConnOpen()
      this.conn.onerror = (error) => this._onConnError(error)
      this.conn.onmessage = (event) => this.onConnMessage(event)
      this.conn.onclose = (event) => this._onConnClose(event)
    }

    this.push({topic: "join",
      event: "meta",
      payload: {
        browser: platform?.name,
        os: platform?.os?.family,
        device: platform?.product || ""
      },
      ref: this.makeRef()
    })
  }

  /**
   * Disconnects the socket.
   *
   * @param code A numeric status code to send on disconnect.
   * @param reason A custom reason for the disconnect.
   */
  disconnect(
    code?: number,
    reason?: string
  ): Promise<{ error: Error | null; data: boolean }> {
    return new Promise((resolve, _reject) => {
      try {
        if (this.conn) {
          this.conn.onclose = function () {} // noop
          if (code) {
            this.conn.close(code, reason || '')
          } else {
            this.conn.close()
          }
          this.conn = null
        }
        resolve({ error: null, data: true })
      } catch (error) {
        resolve({ error, data: false })
      }
    })
  }

  /**
   * Logs the message. Override `this.logger` for specialized logging.
   */
  log(kind: string, msg: string, data?: any) {
    this.logger(kind, msg, data)
  }

  /**
   * Registers a callback for connection state change event.
   * @param callback A function to be called when the event occurs.
   *
   * @example
   *    socket.onOpen(() => console.log("Socket opened."))
   */
  onOpen(callback: Function) {
    this.stateChangeCallbacks.open.push(callback)
  }

  /**
   * Registers a callbacks for connection state change events.
   * @param callback A function to be called when the event occurs.
   *
   * @example
   *    socket.onOpen(() => console.log("Socket closed."))
   */
  onClose(callback: Function) {
    this.stateChangeCallbacks.close.push(callback)
  }

  /**
   * Registers a callback for connection state change events.
   * @param callback A function to be called when the event occurs.
   *
   * @example
   *    socket.onOpen((error) => console.log("An error occurred"))
   */
  onError(callback: Function) {
    this.stateChangeCallbacks.error.push(callback)
  }

  /**
   * Calls a function any time a message is received.
   * @param callback A function to be called when the event occurs.
   *
   * @example
   *    socket.onMessage((message) => console.log(message))
   */
  onMessage(callback: Function) {
    this.stateChangeCallbacks.message.push(callback)
  }

  /**
   * Returns the current state of the socket.
   */
  connectionState() {
    switch (this.conn && this.conn.readyState) {
      case SOCKET_STATES.connecting:
        return 'connecting'
      case SOCKET_STATES.open:
        return 'open'
      case SOCKET_STATES.closing:
        return 'closing'
      default:
        return 'closed'
    }
  }

  /**
   * Retuns `true` is the connection is open.
   */
  isConnected() {
    return this.connectionState() === 'open'
  }

  push(data: Message) {
    let { topic, event, payload, ref } = data
    let callback = () => {
      this.encode(data, (result: any) => {
        this.conn?.send(result)
      })
    }
    this.log('push', `${topic} ${event} (${ref})`, payload)
    if (this.isConnected()) {
      callback()
    } else {
      this.sendBuffer.push(callback)
    }
  }

  initVideo(data: InitParams) {
    const videoItem: HTMLVideoElement = document?.getElementById(data.html_video_element_id) as HTMLVideoElement
    if (!videoItem) {
      console.log("can't find the element with id:", data.html_video_element_id)
      return false
    }
    // videoHeightXvideoWidth after play
    const payload: any = {
      duration: Math.round(videoItem.duration),
      clientWidth: videoItem.clientWidth,
      clientHeight: videoItem.clientHeight,
      src: videoItem.src
    }
    if (data.video_id) payload['video_id'] = data.video_id
    if (data.video_name) payload['video_name'] = data.video_name
    if (data.video_type) payload['video_type'] = data.video_type
    if (data.category_name) payload['category_name'] = data.category_name
    if (data.sub_category_name) payload['sub_category_name'] = data.sub_category_name
    this.push({
      topic: "init",
      event: "meta",
      payload: payload,
      ref: this.makeRef()
    })
    this.addHandlers(videoItem)
  }

  addHandlers(id: HTMLVideoElement) {
    id.addEventListener('loadstart', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('progress', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('suspend', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('abort', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('error', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('emptied', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('stalled', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('loadedmetadata', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('loadeddata', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('canplay', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('canplaythrough', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('playing', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('waiting', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('seeking', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('seeked', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('ended', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('durationchange', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('timeupdate', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('play', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('pause', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('ratechange', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('resize', (e) => {
      return this.handleVideoEvent(e, this)
    })
    id.addEventListener('volumechange', (e) => {
      return this.handleVideoEvent(e, this)
    })
  }

  handleVideoEvent(event: any, self: any) {
    self.log('event', event.type, event)
    let payload = {
      event: event.type,
      code: 0
    }
    if (event?.type == 'error') {
      // console.log('self.target?.error?.code', self.target)
      payload['code'] = event.target?.error?.code
    }
    self.push({
      topic: "player",
      event: "event",
      payload: payload,
      ref: self.makeRef()
    })
  }

  onConnMessage(rawMessage: any) {
    // clearInterval(this.heartbeatTimer)

    this.decode(rawMessage.data, (msg: Message) => {
      let { topic, event, payload, ref } = msg
      if (ref && ref === this.pendingHeartbeatRef) {
        this.pendingHeartbeatRef = null
      }

      // console.log('receive msg', msg)

      this.log(
        'receive',
        // `${payload.status || ''} ${topic} ${event} ${
        //   (ref && '(' + ref + ')') || ''
        // }`,
        "stub",
        payload
      )
      this.stateChangeCallbacks.message.forEach((callback) => callback(msg))
    })
  }

  /**
   * Returns the URL of the websocket.
   */
  endPointURL() {
    return this._appendParams(
      this.endPoint,
      Object.assign({}, this.params, { vsn: VSN })
    )
  }

  /**
   * Return the next message ref, accounting for overflows
   */
  makeRef() {
    let newRef = this.ref + 1
    if (newRef === this.ref) {
      this.ref = 0
    } else {
      this.ref = newRef
    }

    return this.ref.toString()
  }

  private _onConnOpen() {
    this.log('transport', `connected to ${this.endPointURL()}`)
    this._flushSendBuffer()
    this.reconnectTimer.reset()
    // if (!this.conn?.skipHeartbeat) { // Skip heartbeat doesn't exist on w3Socket
    clearInterval(this.heartbeatTimer)
    // this.heartbeatTimer = <any>(
    //   setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalMs)
    // )
    // }
    this.stateChangeCallbacks.open.forEach((callback) => callback())!
  }

  private _onConnClose(event: any) {
    this.log('transport', 'close', event)
    clearInterval(this.heartbeatTimer)
    this.reconnectTimer.scheduleTimeout()
    if (event)
      this.stateChangeCallbacks.close.forEach((callback) => callback(event))
  }

  private _onConnError(error: Error) {
    this.log('transport', error.message)
    this.stateChangeCallbacks.error.forEach((callback) => callback(error))
  }

  private _appendParams(url: string, params: { [key: string]: string }) {
    if (Object.keys(params).length === 0) {
      return url
    }
    let prefix = url.match(/\?/) ? '&' : '?'
    return `${url}${prefix}${querystring.stringify(params)}`
  }

  private _flushSendBuffer() {
    if (this.isConnected() && this.sendBuffer.length > 0) {
      this.sendBuffer.forEach((callback) => callback())
      this.sendBuffer = []
    }
  }

  private _sendHeartbeat() {
    if (!this.isConnected()) {
      return
    }
    if (this.pendingHeartbeatRef) {
      this.pendingHeartbeatRef = null
      this.log(
        'transport',
        'heartbeat timeout. Attempting to re-establish connection'
      )
      this.conn?.close(WS_CLOSE_NORMAL, 'hearbeat timeout')
      return
    }
    this.pendingHeartbeatRef = this.makeRef()
    this.push({
      topic: 'phoenix',
      event: 'heartbeat',
      payload: {},
      ref: this.pendingHeartbeatRef,
    })
  }
}
