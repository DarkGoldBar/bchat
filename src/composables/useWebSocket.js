// src/composables/useWebSocket.js
import { ref, onBeforeUnmount } from 'vue'

const baseWsUrl = process.env.VUE_APP_WS_API_URL

/**
 * Establishes a WebSocket connection to a room.
 *
 * @param {Object} roomId The ID of the room to connect to.
 * @param {string} roomId.value The ID of the room to connect to.
 * @param {Object} me 
 * @param {Object} me.value
 * @param {Object} [options] Options for the connection.
 * @param {function(event):void} [options.onMessage] Called when a message is received.
 * @param {function(event):void} [options.onOpen] Called when the connection is established.
 * @param {function(event):void} [options.onClose] Called when the connection is closed.
 * @param {function(event):void} [options.onError] Called when an error occurs.
 *
 * @returns {Object} An object with the following properties:
 *   - `connect`: Establishes the connection.
 *   - `send`: Sends a message to the room.
 *   - `close`: Closes the connection.
 *   - `ws`: The WebSocket object.
 * 
 * Backend router function:
 * 
 * async function router(route, roomId, connectId, body) {
  switch (route) {
    case "$connect":
      return await handleConnect(roomId);
    case "$disconnect":
      return await handleDisconnect(roomId, connectId);
    case "join":
      return await handleJoin(roomId, body, connectId);
    case "changeposition":
      return await handleChangePosition(roomId, body, connectId);
    case "message":
      return await handleMessage(roomId, body, connectId);
    case "$default":
    default:
      return await handleDefault(roomId, body, connectId);
  }
 */
export function useWebSocket(roomId, me, { onMessage, onOpen, onClose, onError } = {}) {
  const ws = ref(null)

  function connect() {
    ws.value = new WebSocket(`${baseWsUrl}?room=${roomId.value}`)

    ws.value.onopen = (event) => {
      console.log('WebSocket connected')
      if (me) {
        ws.value.send(JSON.stringify({ action: 'lobby', subAction: "join", user: me.value, room: roomId.value}, null, 0))
      }
      onOpen && onOpen(event)
    }

    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage && onMessage(data)
    }

    ws.value.onclose = (event) => {
      console.warn('WebSocket closed')
      onClose && onClose(event)
    }

    ws.value.onerror = (event) => {
      console.error('WebSocket error')
      onError && onError(event)
    }
  }

  function send(data) {
    data.room = roomId.value
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  function close() {
    ws.value && ws.value.close()
  }

  onBeforeUnmount(() => {
    close()
  })

  return {
    connect,
    send,
    close,
    ws
  }
}
