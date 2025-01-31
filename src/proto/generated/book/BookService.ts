// Original file: src/proto/book.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Book as _book_Book, Book__Output as _book_Book__Output } from '../book/Book';
import type { CreateBookRequest as _book_CreateBookRequest, CreateBookRequest__Output as _book_CreateBookRequest__Output } from '../book/CreateBookRequest';
import type { DeleteBookRequest as _book_DeleteBookRequest, DeleteBookRequest__Output as _book_DeleteBookRequest__Output } from '../book/DeleteBookRequest';
import type { DeleteBookResponse as _book_DeleteBookResponse, DeleteBookResponse__Output as _book_DeleteBookResponse__Output } from '../book/DeleteBookResponse';
import type { GetBookRequest as _book_GetBookRequest, GetBookRequest__Output as _book_GetBookRequest__Output } from '../book/GetBookRequest';
import type { ListBooksRequest as _book_ListBooksRequest, ListBooksRequest__Output as _book_ListBooksRequest__Output } from '../book/ListBooksRequest';
import type { ListBooksResponse as _book_ListBooksResponse, ListBooksResponse__Output as _book_ListBooksResponse__Output } from '../book/ListBooksResponse';
import type { UpdateBookRequest as _book_UpdateBookRequest, UpdateBookRequest__Output as _book_UpdateBookRequest__Output } from '../book/UpdateBookRequest';

export interface BookServiceClient extends grpc.Client {
  CreateBook(argument: _book_CreateBookRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  CreateBook(argument: _book_CreateBookRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  CreateBook(argument: _book_CreateBookRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  CreateBook(argument: _book_CreateBookRequest, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  createBook(argument: _book_CreateBookRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  createBook(argument: _book_CreateBookRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  createBook(argument: _book_CreateBookRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  createBook(argument: _book_CreateBookRequest, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  
  DeleteBook(argument: _book_DeleteBookRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_DeleteBookResponse__Output>): grpc.ClientUnaryCall;
  DeleteBook(argument: _book_DeleteBookRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_DeleteBookResponse__Output>): grpc.ClientUnaryCall;
  DeleteBook(argument: _book_DeleteBookRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_DeleteBookResponse__Output>): grpc.ClientUnaryCall;
  DeleteBook(argument: _book_DeleteBookRequest, callback: grpc.requestCallback<_book_DeleteBookResponse__Output>): grpc.ClientUnaryCall;
  deleteBook(argument: _book_DeleteBookRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_DeleteBookResponse__Output>): grpc.ClientUnaryCall;
  deleteBook(argument: _book_DeleteBookRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_DeleteBookResponse__Output>): grpc.ClientUnaryCall;
  deleteBook(argument: _book_DeleteBookRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_DeleteBookResponse__Output>): grpc.ClientUnaryCall;
  deleteBook(argument: _book_DeleteBookRequest, callback: grpc.requestCallback<_book_DeleteBookResponse__Output>): grpc.ClientUnaryCall;
  
  GetBook(argument: _book_GetBookRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  GetBook(argument: _book_GetBookRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  GetBook(argument: _book_GetBookRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  GetBook(argument: _book_GetBookRequest, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  getBook(argument: _book_GetBookRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  getBook(argument: _book_GetBookRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  getBook(argument: _book_GetBookRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  getBook(argument: _book_GetBookRequest, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  
  ListBooks(argument: _book_ListBooksRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_ListBooksResponse__Output>): grpc.ClientUnaryCall;
  ListBooks(argument: _book_ListBooksRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_ListBooksResponse__Output>): grpc.ClientUnaryCall;
  ListBooks(argument: _book_ListBooksRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_ListBooksResponse__Output>): grpc.ClientUnaryCall;
  ListBooks(argument: _book_ListBooksRequest, callback: grpc.requestCallback<_book_ListBooksResponse__Output>): grpc.ClientUnaryCall;
  listBooks(argument: _book_ListBooksRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_ListBooksResponse__Output>): grpc.ClientUnaryCall;
  listBooks(argument: _book_ListBooksRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_ListBooksResponse__Output>): grpc.ClientUnaryCall;
  listBooks(argument: _book_ListBooksRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_ListBooksResponse__Output>): grpc.ClientUnaryCall;
  listBooks(argument: _book_ListBooksRequest, callback: grpc.requestCallback<_book_ListBooksResponse__Output>): grpc.ClientUnaryCall;
  
  UpdateBook(argument: _book_UpdateBookRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  UpdateBook(argument: _book_UpdateBookRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  UpdateBook(argument: _book_UpdateBookRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  UpdateBook(argument: _book_UpdateBookRequest, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  updateBook(argument: _book_UpdateBookRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  updateBook(argument: _book_UpdateBookRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  updateBook(argument: _book_UpdateBookRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  updateBook(argument: _book_UpdateBookRequest, callback: grpc.requestCallback<_book_Book__Output>): grpc.ClientUnaryCall;
  
}

export interface BookServiceHandlers extends grpc.UntypedServiceImplementation {
  CreateBook: grpc.handleUnaryCall<_book_CreateBookRequest__Output, _book_Book>;
  
  DeleteBook: grpc.handleUnaryCall<_book_DeleteBookRequest__Output, _book_DeleteBookResponse>;
  
  GetBook: grpc.handleUnaryCall<_book_GetBookRequest__Output, _book_Book>;
  
  ListBooks: grpc.handleUnaryCall<_book_ListBooksRequest__Output, _book_ListBooksResponse>;
  
  UpdateBook: grpc.handleUnaryCall<_book_UpdateBookRequest__Output, _book_Book>;
  
}

export interface BookServiceDefinition extends grpc.ServiceDefinition {
  CreateBook: MethodDefinition<_book_CreateBookRequest, _book_Book, _book_CreateBookRequest__Output, _book_Book__Output>
  DeleteBook: MethodDefinition<_book_DeleteBookRequest, _book_DeleteBookResponse, _book_DeleteBookRequest__Output, _book_DeleteBookResponse__Output>
  GetBook: MethodDefinition<_book_GetBookRequest, _book_Book, _book_GetBookRequest__Output, _book_Book__Output>
  ListBooks: MethodDefinition<_book_ListBooksRequest, _book_ListBooksResponse, _book_ListBooksRequest__Output, _book_ListBooksResponse__Output>
  UpdateBook: MethodDefinition<_book_UpdateBookRequest, _book_Book, _book_UpdateBookRequest__Output, _book_Book__Output>
}
