import app from './app';
import { config } from './config/env';
import prisma from './config/db';
import { initElasticsearch } from './config/elasticsearch';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    await initElasticsearch();
    
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
