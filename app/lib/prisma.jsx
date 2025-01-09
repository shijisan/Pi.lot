import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable logging for different levels
});

// Log each query
prisma.$on('query', (e) => {
  console.log('Query: ', e.query);
  console.log('Params: ', e.params);
  console.log('Duration: ', e.duration, 'ms');
});

// Catch warnings and errors
prisma.$on('warn', (e) => console.warn('Warning: ', e));
prisma.$on('error', (e) => console.error('Error: ', e));

export default prisma;
