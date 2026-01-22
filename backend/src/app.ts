import { MongoDatabase } from './config/data/mongo/init';
import { envs } from './config/plugins/envs/envs.plugin';
import { AppRoutes } from './presentation/routes';
import { Server } from './presentation/server';

(async () => {
  try {
    // Connect to MongoDB
    await MongoDatabase.connect();

    // Start server
    const server = new Server({
      port: envs.PORT,
      routes: AppRoutes.routes,
    });

    await server.start();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
