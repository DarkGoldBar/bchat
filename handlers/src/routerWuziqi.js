/** @typedef {import('@bchat/types').Room} Room */
/** @typedef {import('@bchat/types').User} User */
const { getInterface } = require('./interface.js')
const impl = getInterface() 

const { Wuziqi } = require('./logicWuziqi.js')

/**
 * @param {string} action
 * @param {Room} room
 * @param {User} user
 * @param {object?} context
 */
module.exports.wuziqiHandler = async (action, room, user, context) => {
  if (action === 'join') return await handleJoin(room, user)
  if (action === 'leave') return await handleLeave(room, user)
  if (action === 'start') return await handleStartGame(room)
  if (action === 'doMove') return await handleDoMove(room, user, context)
  throw new Error(`Invalid subAction: ${action}`)
}

/**
 * @param {Room} room
 */
async function handleStartGame(room) {
  // 校验
  const posLimit = room.posLimit
  const isReady = room.members.filter(m => m.position > 0).length === posLimit
  if (!isReady) {
    throw new Error(`Not enough players ready to start the game`)
  }
  // 逻辑
  const state = JSON.parse(room.body ?? '{}')
  const game = new Wuziqi(state)
  if (!game.doStart()) {
    throw new Error(`Cannot start`)
  }
  const newState = game.export()
  room.body = JSON.stringify(newState)
  // 更新
  await impl.putRoom(room, true, false)
  // 广播
  await broadcastMessage(room, {
    action: 'updateRoom',
    room: room,
  })
}

/**
 * @param {string} subAction
 * @param {Room} room
 * @param {User} user
 * @param {object} context
 * @param {number} context.row
 * @param {number} context.col
 */
async function handleDoMove(room, user, context) {
  // 校验
  const state = JSON.parse(room.body ?? '{}')
  const game = new Wuziqi(state)
  const { row, col } = context
  if (user.position !== game.current) {
    throw new Error("Not your turn")
  }
  if (row == null || col == null) {
    throw new Error("Invalid Context")
  }
  // 逻辑
  if (!game.doMove()) {
    throw new Error('Cannot Move')
  }
  const newState = game.export()
  room.body = JSON.stringify(newState)
  // 更新
  await impl.putRoom(room, true, false)
  // 广播
  await broadcastMessage(room, {
    action: 'updateRoom',
    room: room,
  })
}
