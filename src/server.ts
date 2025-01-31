import Fastify from 'fastify';
import fp from 'fastify-plugin';
import { dbConfig } from './config/database';

const fastify = Fastify({
  logger: true,
});

fastify.register(require('@fastify/postgres'), dbConfig);

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    const address = fastify.server.address();
    const serverAddress = typeof address === 'string' 
      ? address 
      : `http://${address?.address}:${address?.port}`;
    
    fastify.log.info(`Server running on ${serverAddress}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();