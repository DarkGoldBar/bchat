import { injectInterface } from '@bchat/handlers/src/interface.js';
import * as local from './local.js';
injectInterface(local);

async function startServers() {
  const { createHttpServer } = await import('./http.js');
  const { createWebSocketServer } = await import('./websocket.js');

  const httpServer = createHttpServer();
  const { wsServer, wsManageServer } = createWebSocketServer();

  process.on('SIGINT', () => {
    console.log('Shutting down servers...');
    httpServer.close();
    wsServer.close();
    wsManageServer.close();
    process.exit(0);
  });
}

startServers();
