/** @typedef {import('../types.js').Room} Room */
/** @typedef {import('../types.js').User} User */

/** @typedef {Object} Cell
 * @property {'' | 'A' | 'B'} value
 * @property {number} row
 * @property {number} col
 */

const { getInterface } = require('./interface.js')
const impl = getInterface()

/**
 * @param {string} action
 * @param {Room} room
 * @param {User} user
 * @param {object?} context
 */
module.exports.wuziqiHandler = async (action, room, user, context) => {
  if (action === 'join') return await handleJoin(room, user)
  if (action === 'leave') return await handleLeave(room, user)
  if (action === 'startGame') return await handleStartGame(room)
  if (action === 'doMove') return await handleDoMove(room, user, context)
  throw new Error(`Invalid subAction: ${action}`)
}

/**
 * @param {Room} room
 */
async function handleStartGame(room) {
  // 校验
  const cols = 11
  const rows = 11
  const posLimit = room.posLimit
  const isReady = room.members.filter(m => m.position > 0).length === posLimit
  const currentPlayerId = room.members.find(m => m.position === 1)?.uuid
  if (!isReady || !currentPlayerId) {
    throw new Error(`Not enough players ready to start the game`)
  }
  // 逻辑
  room.stage = 'ingame'
  room.body = {
    board: Array.from({ length: rows * cols }).map((_, index) => ({
      value: '',
      row: Math.floor(index / cols),
      col: index % cols,
    })),
    currentPlayerId: currentPlayerId,
    winner: null,
    undoArgs: null,
  }
  // 更新数据库
  await impl.putRoom(room, true, false)
  // 广播更新
  await broadcastMessage(room, {
    action: 'init',
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
  console.log("Handling doMove action")
}
