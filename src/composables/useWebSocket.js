const baseWsUrl = import.meta.env.VITE_WS_URL

/**
 * Establishes a WebSocket connection to a room.
 *
 * @param {string} roomId
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
 */
export default function useWebSocket(roomId, me, { onMessage, onOpen, onClose, onError } = {}) {
  const ws = ref(null)

  function connect() {
    ws.value = new WebSocket(`${baseWsUrl}?room=${roomId}`)

    ws.value.onopen = event => {
      console.log('WebSocket connected')
      if (me) {
        ws.value.send(
          JSON.stringify(
            { action: 'lobby', subAction: 'join', user: me.value, room: roomId },
            null,
            0
          )
        )
      }
      onOpen && onOpen(event)
    }

    ws.value.onmessage = event => {
      const data = JSON.parse(event.data)
      onMessage && onMessage(data)
    }

    ws.value.onclose = event => {
      console.warn('WebSocket closed')
      onClose && onClose(event)
    }

    ws.value.onerror = event => {
      console.error('WebSocket error')
      onError && onError(event)
    }
  }

  function send(data) {
    data.room = roomId
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
