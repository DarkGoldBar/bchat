/** @typedef {import('@bchat/types').Room} Room */
/** @typedef {import('@bchat/types').User} User */

// DynamoDB Document Client
const { PutCommand, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb')
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
const TABLE_ROOM = process.env.TABLE_ROOM || 'Room'
const ddbClient = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(ddbClient)


// ApiGateway WebSocket API
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} = require('@aws-sdk/client-apigatewaymanagementapi')
const WEBSOCKET_EP = process.env.WEBSOCKET_EP
const apiGateway = new ApiGatewayManagementApiClient({ endpoint: WEBSOCKET_EP })

/**
 *
 * @param {string} connectId
 * @param {string} roomId
 */
async function putUser(connectId, roomId) {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE_ROOM,
      Item: {
        id: connectId,
        body: roomId,
        ttl: Math.floor(Date.now() / 1000) + 86400
      }
    })
  )
}

/**
 *
 * @param {string} connectId
 * @return {Promise<{ Item?: { body: string } }>}
 */
async function getAndDeleteUser(connectId) {
  return await dynamo.send(
    new DeleteCommand({
      TableName: TABLE_ROOM,
      Key: { id: connectId },
      ReturnValues: 'ALL_OLD'
    })
  )
}

/**
 *
 * @param {Room} room
 * @param {boolean} checkVersion
 * @param {boolean} checkUnique
 * @returns
 */
async function putRoom(room, checkVersion = false, checkUnique = false) {
  const command = new PutCommand({
    TableName: TABLE_ROOM,
    Item: room
  })
  if (checkVersion) {
    command.ConditionExpression = 'version = :version'
    command.ExpressionAttributeValues = { ':version': room.version }
  }
  if (checkUnique) {
    command.ConditionExpression = 'attribute_not_exists(id)'
  }
  return await dynamo.send(command)
}

/**
 *
 * @param {string} roomId
 * @param {string} connectId
 * @returns {Promise<{ room: Room, user?: User }>}
 */
async function getRoomAndUser(roomId, connectId) {
  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLE_ROOM,
      Key: { id: roomId }
    })
  )
  if (!result.Item) throw new Error('Invalid room')
  const room = result.Item
  room.members = result.Item.members.map(s => JSON.parse(s))
  const user = room.members.find(m => m.connectId === connectId) ?? { connectId }
  return { room, user }
}


/**
 * 向用户发送消息
 * @param {User} user
 * @param {Object} payload
 */
async function sendMessage(user, payload) {
  if (!user.connectId) return
  if (user.connectId.startsWith('$TEST')) {
    console.log(JSON.stringify(payload))
    return
  }
  try {
    const s = JSON.stringify(payload)
    await apiGateway.send(
      new PostToConnectionCommand({
        ConnectionId: user.connectId,
        Data: Buffer.from(s)
      })
    )
    console.log(`Post -> ${user.connectId}: ${s}`)
  } catch (err) {
    if (err.name === 'GoneException') {
      console.warn(`GoneException ${user.connectId}`)
    } else {
      throw err
    }
  }
}

/**
 * 广播消息到多个用户
 * @param {Room} room
 * @param {Object} payload
 */
async function broadcastMessage(room, payload) {
  if (!room || !room.members || room.members.length === 0) {
    console.warn('No members in the room to broadcast to.')
    return
  }
  const broadcasts = room.members
    .filter(m => m.connectId)
    .map(async user => sendMessage(user, payload))
  await Promise.all(broadcasts)
}

module.exports = {
  name: "aws",
  putUser,
  putRoom,
  getAndDeleteUser,
  getRoomAndUser,
  sendMessage,
  broadcastMessage
}
