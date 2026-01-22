import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { envs } from '../envs/envs.plugin';

export class SocketPlugin {
  private io: SocketServer;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: envs.CORS_ORIGIN,
        credentials: true,
      },
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.io.on('connection', (socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): SocketServer {
    return this.io;
  }
}
