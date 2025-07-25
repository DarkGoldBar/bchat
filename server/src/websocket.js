// src/websocket.js
import express from 'express';
import { WebSocketServer } from 'ws';
import { handler } from '../functions/wsHandler/app.js';

// 用于存储活跃的 WebSocket 连接
const connections = new Map();

export function createWebSocketServer() {
  const wss = new WebSocketServer({ port: 3001 });
  const app = express();
  const postToConnectionPort = process.env.POST_TO_CONNECTION_PORT || 3002;

  // WebSocket 服务器事件处理
  wss.on('connection', async (ws, req) => {
    const connectionId = generateConnectionId();

    // 存储连接
    connections.set(connectionId, ws);

    // 模拟 API Gateway 的 connect 事件
    const connectEvent = {
      queryStringParameters: req.queryStringParameters,
      requestContext: {
        connectionId: connectionId,
        eventType: 'CONNECT',
        routeKey: '$connect'
      }
    };

    try {
      await handler(connectEvent, { connectionId });
    } catch (error) {
      console.error('Connection error:', error);
      ws.close();
    }

    // 消息处理
    ws.on('message', async (message) => {
      const messageEvent = {
        requestContext: {
          connectionId: connectionId,
          eventType: 'MESSAGE',
          routeKey: '$default'
        },
        body: message.toString()
      };

      try {
        messageEvent.requestContext.routeKey = JSON.parse(messageEvent.body).route;
      } catch {
        messageEvent.requestContext.routeKey = '$default'
      }

      try {
        await handler(messageEvent, { connectionId });
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // 连接关闭处理
    ws.on('close', async () => {
      connections.delete(connectionId);

      const disconnectEvent = {
        requestContext: {
          connectionId: connectionId,
          eventType: 'DISCONNECT',
          routeKey: '$disconnect'
        }
      };

      try {
        await handler(disconnectEvent, { connectionId });
      } catch (error) {
        console.error('Error processing disconnect:', error);
      }
    });
  });

  // 创建一个 HTTP 服务用于模拟 PostToConnectionCommand
  app.use(express.json());
  app.post('/connections/:connectionId', async (req, res) => {
    const { connectionId } = req.params;
    const { data } = req.body;

    const ws = connections.get(connectionId);

    // 410 GoneException
    if (!ws) {
      return res.status(410).json({
        __type: 'GoneException',
        message: `Connection ${connectionId} is gone`
      });
    }

    try {
      ws.send(data);
      res.json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  const postToConnectionServer = app.listen(postToConnectionPort, () => {
    console.log(`PostToConnection Server running on port ${postToConnectionPort}`);
  });

  // 返回 WebSocket 服务器和 PostToConnection 服务器
  return {
    wss,
    postToConnectionServer
  };
}

// 生成唯一的连接 ID
function generateConnectionId() {
  return `connection-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
