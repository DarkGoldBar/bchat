import { createClient } from 'redis';

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});
await redis.connect();
const TABLE_ROOM = 'room:';

const WS_ENDPOINT = `http://localhost:3002/connections/`;

export const name = 'local';

/** @type { import('@bchat/handlers/src/awsImplement.js').putRoom } */
export async function putRoom(room, checkVersion = false, checkUnique = false) {
  const key = TABLE_ROOM + room.id;
  room.members = room.members.map(m => JSON.stringify(m));
  await redis.set(key, JSON.stringify(room));
  return { $metadata: { httpStatusCode: 200 } };
}

/** @type { import('@bchat/handlers/src/awsImplement.js').putUser } */
export async function putUser(connectId, roomId) {
  const key = TABLE_ROOM + connectId;
  const data = { body: roomId, ttl: Math.floor(Date.now() / 1000) + 86400 };  
  await redis.set(key, JSON.stringify(data));
  return { $metadata: { httpStatusCode: 200 } };
}

/** @type { import('@bchat/handlers/src/awsImplement.js').getAndDeleteUser } */
export async function getAndDeleteUser(connectId) {
  const key = TABLE_ROOM + connectId;
  const resp = await redis.get(key);
  redis.del(key);
  const result = { $metadata: { httpStatusCode: 200 } };
  if (resp) result.Item = JSON.parse(resp);
  return result;
}

/** @type { import('@bchat/handlers/src/awsImplement.js').getRoomAndUser } */
export async function getRoomAndUser(roomId, connectId) {
  const key = TABLE_ROOM + roomId;
  const roomData = await redis.get(key);
  if (!roomData) {
    throw new Error(`Room with id ${roomId} not found`);
  }
  const room = JSON.parse(roomData);
  room.members = room.members.map(s => JSON.parse(s))
  const user = room.members.find(m => m.connectId === connectId) ?? { connectId }
  return { room, user }
}

/** @type { import('@bchat/handlers/src/awsImplement.js').updateRoomMember } */
export async function updateRoomMember(room, userIndex) {
  const key = TABLE_ROOM + room.id;
  const roomData = await redis.get(key);
  if (!roomData) {
    throw new Error(`Room with id ${room.id} not found`);
  }
  const dbroom = JSON.parse(roomData);
  dbroom.members[userIndex] = JSON.stringify(room.members[userIndex]);
  await redis.set(key, JSON.stringify(dbroom));
  return { $metadata: { httpStatusCode: 200 } };
}

/** @type { import('@bchat/handlers/src/awsImplement.js').pushUser } */
export async function pushRoomMember(room, user) {
  const key = TABLE_ROOM + room.id;
  const roomData = await redis.get(key);
  if (!roomData) {
    throw new Error(`Room with id ${room.id} not found`);
  }
  const dbroom = JSON.parse(roomData);
  dbroom.members.push(JSON.stringify(user));
  await redis.set(key, JSON.stringify(dbroom));
  return { $metadata: { httpStatusCode: 200 } };
}


/** @type { import('@bchat/handlers/src/awsImplement.js').sendMessage } */
export async function sendMessage(user, payload) {
  if (!user.connectId) return
  const url = `${WS_ENDPOINT}${user.connectId}`;
  const data = { data: JSON.stringify(payload) };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.warn(`WS POST Failed: ${res.status} ${res.statusText} - ${errorBody}`);
    if (res.status === 410) {
      console.warn(`GoneException ${user.connectId}`);
    }
    throw new Error(`WebSocket POST failed: ${res.status}`);
  }
}

/** @type { import('@bchat/handlers/src/awsImplement.js').broadcastMessage } */
export async function broadcastMessage(room, payload) {
  if (!room || !room.members || room.members.length === 0) {
    console.warn('No members in the room to broadcast to.')
    return
  }
  const broadcasts = room.members
    .filter(m => m.connectId)
    .map(async user => sendMessage(user, payload))
  await Promise.all(broadcasts)
}
