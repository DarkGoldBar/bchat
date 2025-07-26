import { injectInterface } from '@bchat/handlers/src/interface.js';
import * as local from './local.js';
injectInterface(local);

import { createHttpServer } from './http.js';
import { createWebSocketServer } from './websocket.js';

function startServers() {
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
