import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { BookServiceClient as _book_BookServiceClient, BookServiceDefinition as _book_BookServiceDefinition } from './book/BookService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  book: {
    Book: MessageTypeDefinition
    BookService: SubtypeConstructor<typeof grpc.Client, _book_BookServiceClient> & { service: _book_BookServiceDefinition }
    CreateBookRequest: MessageTypeDefinition
    DeleteBookRequest: MessageTypeDefinition
    DeleteBookResponse: MessageTypeDefinition
    GetBookRequest: MessageTypeDefinition
    ListBooksRequest: MessageTypeDefinition
    ListBooksResponse: MessageTypeDefinition
    UpdateBookRequest: MessageTypeDefinition
  }
}

