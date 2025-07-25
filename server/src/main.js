// src/main.js
import { createHttpServer } from './http.js';
import { createWebSocketServer } from './websocket.js';

function startServers() {
  const httpServer = createHttpServer();
  const { wss, postToConnectionServer } = createWebSocketServer();

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('Shutting down servers...');
    httpServer.close();
    wss.close();
    postToConnectionServer.close();
    process.exit(0);
  });
}

startServers();