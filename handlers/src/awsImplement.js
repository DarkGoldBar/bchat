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
    Item: {
      ...room,
      members: room.members.map(m => JSON.stringify(m)),
      version: room.version + 1
    }
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
 *
 * @param {Room} room
 * @param {User} user
 */
async function pushRoomMember(room, user) {
  const userString = JSON.stringify(user)

  const command = new UpdateCommand({
    TableName: TABLE_ROOM,
    Key: { id: room.id },
    UpdateExpression:
      'SET #members = list_append(if_not_exists(#members, :empty), :newMember), #version = :newVer',
    ConditionExpression: '#version = :ver',
    ExpressionAttributeNames: {
      '#members': 'members',
      '#version': 'version'
    },
    ExpressionAttributeValues: {
      ':newMember': [userString],
      ':empty': [],
      ':ver': room.version,
      ':newVer': room.version + 1
    }
  })
  await dynamo.send(command)
}

/**
 *
 * @param {Room} room
 * @param {User} user
 * @param {number} userIndex
 */
async function popRoomMember(room, userIndex) {
  const command = new UpdateCommand({
    TableName: TABLE_ROOM,
    Key: { id: room.id },
    UpdateExpression: `REMOVE #members[${userIndex}] SET #version = :newVer`,
    ConditionExpression: '#version = :ver',
    ExpressionAttributeNames: {
      '#members': 'members',
      '#version': 'version'
    },
    ExpressionAttributeValues: {
      ':ver': room.version,
      ':newVer': room.version + 1
    }
  })
  await dynamo.send(command)
}

/**
 *
 * @param {Room} room
 * @param {User} user
 * @param {number} userIndex
 */
async function updateRoomMember(room, userIndex) {
  const userString = JSON.stringify(room.members[userIndex])

  const command = new UpdateCommand({
    TableName: TABLE_ROOM,
    Key: { id: room.id },
    ConditionExpression: '#version = :ver',
    UpdateExpression: `SET #members[${userIndex}] = :user, #version = :newVer`,
    ExpressionAttributeNames: {
      '#members': 'members',
      '#version': 'version'
    },
    ExpressionAttributeValues: {
      ':user': userString,
      ':ver': room.version,
      ':newVer': room.version + 1
    },
    ReturnValues: 'NONE'
  })
  await dynamo.send(command)
}

/**
 * 向用户发送消息
 * @param {User} user
 * @param {Object} payload
 * @param {(user: User) => void} [goneException]
 */
async function sendMessage(user, payload, goneException) {
  if (!user.connectId) return;
  if (user.connectId.startsWith('$TEST')) {
    console.log(JSON.stringify(payload));
    return;
  }
  try {
    const s = JSON.stringify(payload);
    await apiGateway.send(
      new PostToConnectionCommand({
        ConnectionId: user.connectId,
        Data: Buffer.from(s)
      })
    );
    console.log(`Post -> ${user.connectId}: ${s}`);
  } catch (err) {
    if (err.name === 'GoneException') {
      console.warn(`GoneException ${user.connectId}`);
      if (typeof goneException === 'function') {
        goneException(user);
      }
    } else {
      throw err;
    }
  }
}

/**
 * 广播消息到多个用户
 * @param {Room} room
 * @param {Object} payload
 * @param {(user: User) => void} [goneException] - 可选 GoneException 回调
 */
async function broadcastMessage(room, payload, goneException) {
  if (!room || !room.members || room.members.length === 0) {
    console.warn('No members in the room to broadcast to.');
    return;
  }
  const broadcasts = room.members
    .filter(m => m.connectId)
    .map(user => sendMessage(user, payload, goneException));

  await Promise.all(broadcasts);
}

module.exports = {
  name: 'aws',
  putUser,
  putRoom,
  getAndDeleteUser,
  getRoomAndUser,
  pushRoomMember,
  popRoomMember,
  updateRoomMember,
  sendMessage,
  broadcastMessage
}
