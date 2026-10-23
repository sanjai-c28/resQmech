import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚗 resQmech Roadside Assistance Dispatch Engine Online`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`📍 Seeded coordinates: Chennai Central (13.0827, 80.2707)`);
  console.log(`🔧 5 Sample Mechanics ready in T. Nagar, Guindy, Anna Nagar, Adyar, Royapettah`);
  console.log(`⚡ API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`=======================================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
