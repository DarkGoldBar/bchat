/** @typedef {import('../types.js').Room} Room */
/** @typedef {import('../types.js').User} User */

const awsImplement = require('./awsImplement.js')
const { getInterface } = require('./interface.js')
const impl = getInterface() 

const MAX_MEMBER = 20

/** @type {Record<string, (room: Room, user: User, context: object?) => Promise>}   */
const ActionMap = {
  join: handleJoin,
  leave: handleLeave,
  setPosition: handleSetPosition,
  setPosLimit: handleSetPosLimit,
  setSelf: handleSetSelf,
}

/**
 * @param {string} action
 * @param {Room} room
 * @param {User} user
 * @param {object?} context
 * @returns
 */
module.exports.lobbyHandler = async (action, room, user, context) => {
  if (!(action && room && user)) throw new Error(`Invalid param`)
  const handler = ActionMap[action]
  if (!handler) throw new Error(`Invalid action: ${action}`)
  return await handler(room, user, context)
}

/**
 * @param {Room} room
 * @param {User} user
 */
async function handleJoin(room, user) {
  if (!(user && user.uuid && user.connectId && user.name && user.avatar)) {
    console.error('Invalid user data', user)
    throw new Error(`Invalid param`)
  }
  /** @type {User} */
  let newUser = room.members.find(m => m.uuid === user.uuid)
  if (newUser) {
    console.log('User exist')
    newUser.connectId = user.connectId
    const userIndex = room.members.indexOf(newUser)
    await impl.updateRoomMember(room, userIndex)
  } else {
    console.log('User not exist')
    if (room.members.length + 1 >= MAX_MEMBER) throw new Error('Max members reached')
    newUser = user
    newUser.position = 0
    room.members.push(newUser)
    await impl.pushUser(room, newUser)
  }
  // 广播更新
  await impl.broadcastMessage(room, {
    action: 'init',
    room: room,
  })
}

/**
 * @param {Room} room
 * @param {User} user
 */
async function handleLeave(room, user) {
  const userIndex = room.members.indexOf(user)
  if (userIndex < 0) {
    throw new Error(`User not found in room: ${user.uuid} ${user.connectId}`)
  }
  room.members.splice(userIndex, 1)
  await impl.popRoomMember(room, userIndex)
  await impl.broadcastMessage(room, {
    action: 'init',
    room: room,
  })
}

/**
 * @param {Room} room
 * @param {User} user
 * @param {object} context
 * @param {number} context.position
 */
async function handleSetPosition(room, user, context) {
  // 校验
  const position = context.position
  if (position === undefined || position === null) {
    throw new Error(`Invalid param`)
  }
  // 逻辑
  if (position !== 0 && room.members.some(m => m.position === position)) {
    throw new Error('Invalid position')
  }
  user.position = position
  userIndex = room.members.indexOf(user)
  // 更新数据库
  await impl.updateRoomMember(room, userIndex)
  // 广播更新
  await impl.broadcastMessage(room, {
    action: 'init',
    room: room,
  })
}

/**
 * @param {Room} room
 * @param {User} user
 * @param {object} context
 * @param {User} context.me
 */
async function handleSetSelf(room, user, context) {
  // 校验
  const me = context.me
  if (!me) throw new Error(`Invalid param`)
  // 逻辑
  user.name = me.name
  user.avatar = me.avatar
  userIndex = room.members.indexOf(user)
  // 更新数据库
  await impl.updateRoomMember(room, userIndex)
  // 广播更新
  await impl.broadcastMessage(room, {
    action: 'init',
    room: room,
  })
}

/**
 * @param {Room} room
 * @param {User} user
 * @param {object} context
 * @param {number} context.posLimit
 */
async function handleSetPosLimit(room, user, context) {
  // 校验
  const posLimit = context.posLimit
  if (position === undefined || position === null) {
    throw new Error(`Invalid param`)
  }
  // 逻辑
  room.posLimit = posLimit
  room.members.forEach(m => {
    if (m.position > posLimit) {
      m.position = 0
    }
  })
  // 更新数据库
  await impl.putRoom(room, true, false)
  // 广播更新
  await impl.broadcastMessage(room, {
    action: 'init',
    room: room,
  })
}
