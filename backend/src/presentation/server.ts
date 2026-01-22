import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer, Server as HttpServer } from 'http';
import { envs } from '../config/plugins/envs/envs.plugin';
import { SocketPlugin } from '../config/plugins/socket/socket.plugin';

interface ServerOptions {
  port: number;
  routes: express.Router;
}

export class Server {
  private readonly app: Application;
  private readonly port: number;
  private readonly routes: express.Router;
  private httpServer?: HttpServer;
  private socketPlugin?: SocketPlugin;

  constructor(options: ServerOptions) {
    const { port, routes } = options;
    this.app = express();
    this.port = port;
    this.routes = routes;

    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    // Security
    this.app.use(helmet());
   
    // CORS
    this.app.use(
      cors({
        origin: envs.CORS_ORIGIN,
        credentials: true,
      })
    );

    // Body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private configureRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use('/api/v1', this.routes);

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  public async start(): Promise<void> {
    // Create HTTP server
    this.httpServer = createServer(this.app);

    // Initialize Socket.io
    this.socketPlugin = new SocketPlugin(this.httpServer);

    // Start listening
    this.httpServer.listen(this.port, () => {
      console.log(`\n✨ Server is running on port ${this.port}`);
      console.log(`✅ Environment: ${envs.NODE_ENV}`);
      console.log(`🌐 API Base URL: http://localhost:${this.port}/api/v1`);
      console.log(`🔌 Socket.io: Enabled`);
      console.log(`\n⏳ Waiting for requests...\n`);
    });
  }

  public getIO() {
    return this.socketPlugin?.getIO();
  }

  public close(): void {
    this.httpServer?.close();
  }
}
