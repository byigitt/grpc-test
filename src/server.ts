import Fastify from 'fastify';
import fp from 'fastify-plugin';
import { dbConfig } from './config/database';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { BookService } from './services/book.service';

const fastify = Fastify({
  logger: true,
});

fastify.register(require('@fastify/postgres'), dbConfig);

const PROTO_PATH = path.resolve(__dirname, 'proto/book.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const bookProto = protoDescriptor.book;

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    const address = fastify.server.address();
    const serverAddress = typeof address === 'string' 
      ? address 
      : `http://${address?.address}:${address?.port}`;
    
    fastify.log.info(`Server running on ${serverAddress}`);

    const grpcServer = new grpc.Server();
    grpcServer.addService(bookProto.BookService.service, new BookService(fastify));
    
    grpcServer.bindAsync(
      '0.0.0.0:50051',
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          throw error;
        }

        fastify.log.info(`gRPC Server running on 0.0.0.0:${port}`);
      }
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();