/** @typedef {import('@bchat/types').WebSocketEvent} WebSocketEvent */
import express from 'express'
import { WebSocketServer } from 'ws'
import { handler } from '@bchat/handlers/src/websocket.js'

// 用于存储活跃的 WebSocket 连接
const connections = new Map()
// 路由键，用于区分不同的 WebSocket 路由
const routeKey = process.env.WS_ROUTE_KEY || 'route'

const wsManagePort = process.env.WS_MANAGE_PORT || 3002
const wsPort = process.env.WS_PORT || 3001

export function createWebSocketServer() {
  // 创建一个 WebSocket 服务
  const wsServer = new WebSocketServer({ port: wsPort })
  console.log(`wsServer running on port ${wsPort}`)

  wsServer.on('connection', async (ws, req) => {
    const connectionId = generateConnectionId()
    connections.set(connectionId, ws)

    /** @type {WebSocketEvent} */
    const connectEvent = {
      requestContext: {
        connectionId: connectionId,
        routeKey: '$connect',
        stage: 'dev'
      },
      headers: req.headers,
      queryStringParameters: req.url
        ? Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams.entries())
        : {}
    }

    try {
      await handler(connectEvent)
    } catch (error) {
      console.error('Connection error:', error)
      console.log('connectEvent:', connectEvent)
      ws.close()
    }

    // 消息处理
    ws.on('message', async message => {
      /** @type {WebSocketEvent} */
      const messageEvent = {
        requestContext: {
          connectionId: connectionId,
          routeKey: '$default',
          stage: 'dev'
        },
        body: message.toString()
      }

      try {
        messageEvent.requestContext.routeKey = JSON.parse(messageEvent.body)[routeKey] || '$default'
      } catch {
        messageEvent.requestContext.routeKey = '$default'
      }

      try {
        await handler(messageEvent)
      } catch (error) {
        console.error('Error processing message:', error)
      }
    })

    // 连接关闭处理
    ws.on('close', async () => {
      connections.delete(connectionId)

      const disconnectEvent = {
        requestContext: {
          connectionId: connectionId,
          routeKey: '$disconnect',
          stage: 'dev'
        }
      }

      try {
        await handler(disconnectEvent)
      } catch (error) {
        console.error('Error processing disconnect:', error)
      }
    })
  })

  // 创建一个 HTTP 服务用于模拟 Apigateway 管理 WebSocket 链接
  const app = express()
  app.use(express.json())
  app.post('/connections/:connectionId', async (req, res) => {
    const { connectionId } = req.params
    const { data } = req.body

    const ws = connections.get(connectionId)

    // 410 GoneException
    if (!ws) {
      return res.status(410).json({
        __type: 'GoneException',
        message: `Connection ${connectionId} is gone`
      })
    }

    try {
      ws.send(data)
      res.json({ message: 'Message sent successfully' })
    } catch (error) {
      console.error('Error sending message:', error)
      res.status(500).json({ message: 'Failed to send message' })
    }
  })

  const wsManageServer = app.listen(wsManagePort, () => {
    console.log(`PostToConnection Server running on port ${wsManagePort}`)
  })

  // 返回服务器对象
  return {
    wsServer,
    wsManageServer
  }
}

// 生成唯一的连接 ID
function generateConnectionId() {
  return `connection-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
