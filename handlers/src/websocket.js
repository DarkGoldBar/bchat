/** @typedef {import('@bchat/types.js').Room} Room */
/** @typedef {import('@bchat/types.js').User} User */

const { getInterface } = require('./interface.js')
const impl = getInterface()
const { lobbyHandler } = require('./routerLobby')
const { wuziqiHandler } = require('./routerWuziqi')

const MAX_RETRIES = 3

/** @type {import('aws-lambda').APIGatewayProxyWebsocketHandlerV2} */
module.exports.handler = async (event) => {
  const requestContext = event.requestContext
  const connectId = requestContext.connectionId
  const body = event.body ? JSON.parse(event.body) : {} // event.body 存在却无法解析时，直接Crash
  const route = body.route || requestContext.routeKey
  const action = body.action
  const queryParams = event.queryStringParameters || {}
  const roomId = queryParams.roomId || body.roomId
  console.log(`READ route=${route};action=${action};roomId=${roomId};connectId=${connectId};body=${event.body}`)

  for (let trials = 0; trials < MAX_RETRIES; trials++) {
    try {
      await router(route, action, roomId, connectId, body)
      return { statusCode: 200 }
    } catch (err) {
      if (err.name !== 'ConditionalCheckFailedException') throw err
    }
  }
  throw new Error('Max trials reached')
}

async function router(route, action, roomId, connectId, body) {
  if (route === '$connect') return await handleConnect(connectId, roomId)
  if (route === '$disconnect') return await handleDisconnect(connectId)
  const { room, user } = await impl.getRoomAndUser(roomId, connectId)
  if (route === 'join') return await handleJoin(room, user, body)
  if (route === 'message') return await handleMessage(room, user, body)
  if (route === 'lobby') return await lobbyHandler(action, room, user, body)
  if (route === 'wuziqi') return await wuziqiHandler(action, room, user, body)
  throw new Error(`Invalid route: ${route}`)
}

/**
 * 验证权限 & 保存链接
 * @param {string} connectId
 * @param {string} roomId
 */
async function handleConnect(connectId, roomId) {
  if (!roomId) {
    throw new Error(`Invalid param`)
  }
  await impl.putUser(connectId, roomId)
}

/**
 * 加入通知
 * @param {Room} room
 * @param {User} user
 */
async function handleJoin(room, user, body) {
  user = {
    ...body.me,
    connectId: user.connectId
  }
  // 通知对应的hander
  if (room.stage === 'lobby') {
    await lobbyHandler('join', room, user)
  } else if (room.stage === 'ingame') {
    await wuziqiHandler('join', room, user)
  } else if (room.stage === 'gameover') {
    // 什么也不做
  } else {
    throw new Error(`Invalid room stage: ${room.stage}`)
  }
}

/**
 * 删除链接 & 离开通知
 * @param {string} connectId
 */
async function handleDisconnect(connectId) {
  const result = await impl.getAndDeleteUser(connectId)
  if (!result.Item) throw new Error(`User not found: ${connectId}`)
  const roomId = result.Item.body
  const { room, user } = await impl.getRoomAndUser(roomId, connectId)
  // 通知对应的hander
  if (room.stage === 'lobby') {
    await lobbyHandler('leave', room, user)
  } else if (room.stage === 'ingame') {
    await wuziqiHandler('leave', room, user)
  } else if (room.stage === 'gameover') {
    // 什么也不做
  } else {
    throw new Error(`Invalid room stage: ${room.stage}`)
  }
}

/**
 * 纯发消息
 * @param {Room} room 
 * @param {User} user 
 * @param {{ message: string, sendto?: string }} body 
 */
async function handleMessage(room, user, body) {
  const { message, sendto } = body.message
  if (!message) throw new Error(`Invalid param`)
  const payload = { sender: user.uuid, message }

  if (!sendto) {
    await impl.broadcastMessage(room, payload)
  } else {
    const target = room.members.find(m => m.uuid === body.sendto)
    if (target) {
      await impl.sendMessage(target, payload)
    } else {
      throw new Error(`Invalid sendto: ${body.sendto}`)
    }       
  }
}
