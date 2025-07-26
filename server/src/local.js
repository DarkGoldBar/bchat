import { createClient } from 'redis';

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});
await redis.connect(); // 确保连接在调用之前建立

const TABLE_ROOM = 'room:'; // Redis 中的 key 前缀

/** @type { import('@bchat/handlers/src/awsImplement.js').putRoom } */
export async function putRoom(room, checkVersion = false, checkUnique = false) {
  const key = TABLE_ROOM + room.id;
  await redis.set(key, JSON.stringify(room));
  return { $metadata: { httpStatusCode: 200 } };
}

/** @type { import('@bchat/handlers/src/awsImplement.js').putUser } */
export async function putUser(connectId, roomId) {
  const key = TABLE_ROOM + connectId;
  await redis.set(key, roomId);
  return { $metadata: { httpStatusCode: 200 } };
}

/** @type { import('@bchat/handlers/src/awsImplement.js').getAndDeleteUser } */
export async function getAndDeleteUser(connectId) {
  const key = TABLE_ROOM + connectId;
  const Item = await redis.get(key);
  redis.del(key);
  return { $metadata: { httpStatusCode: 200 }, Item };
}

