/** @typedef {import('../types.js').User} User */
/** @typedef {import('../types.js').Room} Room */
import { ref, onBeforeUnmount } from 'vue'

const WS_URL = import.meta.env.VITE_WS_URL

/** @param {string} roomId */
export default function useComm(roomId) {
  /** @type {WebSocket | null} */
  let ws = null
  /** @type {User} */
  let me = getLocalUser()
  /** @type {import('vue').Ref<Room>} */
  const room = ref({})

  function connect(onData, onClose, onError) {
    if (!WS_URL || !roomId) return;
    ws = new WebSocket(`${WS_URL}?room=${roomId}`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      if (me) {
        ws.send(JSON.stringify({ action: 'join', me }))
      }
    }

    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      if (data.action === 'updateRoom') {
        room.value = data.room
      } else if (data.action === 'updateBody') {
        room.value.body = data.body
      } else if (data.action === 'udpateUser') {
        const index = room.value.members.findIndex(m => m.uuid === data.user.uuid)
        if (index) {
          room.value.members[index] = data.user
        }
        if (me.uuid === data.user.uuid) {
          me = data.user
          setLocalUser(me)
        }
      } else {
        onData && onData(data)
      }
    }

    ws.onclose = event => {
      console.log('WebSocket closed')
      onClose && onClose(event)
    }

    ws.onerror = event => {
      console.log('WebSocket error')
      onError && onError(event)
    }
  }

  function send(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...data,
        roomId
      }))
    }
  }

  function close() {
    ws && ws.close()
  }

  onBeforeUnmount(() => {
    close()
  })

  return {
    connect,
    send,
    close,
    ws,
    me,
    room
  }
}


/**
 * @param {User} param0 
 */
function setLocalUser({ uuid, name, avatar }) {
  localStorage.setItem('uuid', uuid)
  localStorage.setItem('name', name)
  localStorage.setItem('avatar', JSON.stringify(avatar))
}

/**
 * @returns User
 */
function getLocalUser() {
  let uuid = localStorage.getItem('uuid')
  if (!uuid || uuid === 'undefined') uuid = crypto.randomUUID()

  let name = localStorage.getItem('name')
  if (!name || name === 'undefined') name = uuid.slice(-4)

  let avatar = {}
  let avatarStr = localStorage.getItem('avatar')
  if (!avatarStr || avatarStr === 'undefined') avatarStr = '{"icon":"mdi-account","color":"#42a5f5"}'
  avatar = JSON.parse(avatarStr)

  setLocalUser({ uuid, name, avatar })

  return {
    uuid,
    name,
    avatar,
    position: 0,
  }
}