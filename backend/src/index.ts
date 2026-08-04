import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { connectDB, disconnectDB } from './config/db';
import { seedRooms } from './config/seed';
import router from './routes/meeting.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

// Middleware configuration
app.use(helmet());
app.use(cors({
  origin: '*', // For demo purposes; configure production domains as needed
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(compression());
app.use(express.json());
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Register API routes
app.use('/api', router);

// Register 404 & Global Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    await seedRooms();

    const server = app.listen(config.PORT, () => {
      console.log(`🚀 Meeting Room Scheduler API listening on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });

    const gracefulShutdown = async () => {
      console.log('📡 Initiating graceful shutdown...');
      server.close(async () => {
        console.log('📡 Express server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;
