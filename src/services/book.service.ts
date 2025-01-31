import { FastifyInstance } from 'fastify';
import { ServerUnaryCall, sendUnaryData, ServerWritableStream } from '@grpc/grpc-js';
import { Status } from '@grpc/grpc-js/build/src/constants';
import * as grpc from '@grpc/grpc-js';
import '@fastify/postgres';

import { Book } from '../proto/generated/book/Book';
import { GetBookRequest } from '../proto/generated/book/GetBookRequest';
import { ListBooksRequest } from '../proto/generated/book/ListBooksRequest';
import { CreateBookRequest } from '../proto/generated/book/CreateBookRequest';
import { UpdateBookRequest } from '../proto/generated/book/UpdateBookRequest';
import { DeleteBookRequest } from '../proto/generated/book/DeleteBookRequest';
import { ListBooksResponse } from '../proto/generated/book/ListBooksResponse';
import { DeleteBookResponse } from '../proto/generated/book/DeleteBookResponse';

export class BookService implements grpc.UntypedServiceImplementation {
  [key: string]: any;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async GetBook(call: ServerUnaryCall<GetBookRequest, Book>, callback: sendUnaryData<Book>) {
    try {
      const { id } = call.request;
      const { rows } = await this.fastify.pg.query<Book>(
        'SELECT id, title, author, isbn, publish_year as "publishYear" FROM books WHERE id = $1',
        [id]
      );
      
      if (rows.length === 0) {
        return callback({
          code: Status.NOT_FOUND,
          message: 'Book not found',
        }, null);
      }

      callback(null, rows[0]);
    } catch (err) {
      callback({
        code: Status.INTERNAL,
        message: 'Internal server error',
      }, null);
    }
  }

  async CreateBook(call: ServerUnaryCall<CreateBookRequest, Book>, callback: sendUnaryData<Book>) {
    try {
      const { title, author, isbn, publishYear } = call.request;

      // Validate ISBN format
      if (isbn && !/^\d{13}$/.test(isbn)) {
        return callback({
          code: Status.INVALID_ARGUMENT,
          message: 'ISBN must be 13 digits',
        });
      }

      const { rows } = await this.fastify.pg.query<Book>(
        `INSERT INTO books (title, author, isbn, publish_year) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, title, author, isbn, publish_year as "publishYear"`,
        [title, author, isbn, publishYear]
      );

      callback(null, rows[0]);
    } catch (error: any) {
      if (error.constraint === 'books_isbn_key') {
        return callback({
          code: Status.ALREADY_EXISTS,
          message: 'Book with this ISBN already exists',
        });
      }

      callback({
        code: Status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async ListBooks(call: ServerUnaryCall<ListBooksRequest, ListBooksResponse>, callback: sendUnaryData<ListBooksResponse>) {
    try {
      const { page = 1, limit = 10 } = call.request;
      const offset = (page - 1) * limit;

      const { rows: books } = await this.fastify.pg.query<Book>(
        `SELECT id, title, author, isbn, publish_year as "publishYear" 
         FROM books 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const { rows: [{ total }] } = await this.fastify.pg.query<{ total: string }>(
        'SELECT COUNT(*)::integer as total FROM books'
      );

      callback(null, { books, total: parseInt(total) });
    } catch (error) {
      callback({
        code: Status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async UpdateBook(call: ServerUnaryCall<UpdateBookRequest, Book>, callback: sendUnaryData<Book>) {
    try {
      const { id, title, author, isbn, publishYear } = call.request;

      if (isbn && !/^\d{13}$/.test(isbn)) {
        return callback({
          code: Status.INVALID_ARGUMENT,
          message: 'ISBN must be 13 digits',
        });
      }

      const { rows } = await this.fastify.pg.query<Book>(
        `UPDATE books 
         SET title = COALESCE($2, title),
             author = COALESCE($3, author),
             isbn = COALESCE($4, isbn),
             publish_year = COALESCE($5, publish_year),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, title, author, isbn, publish_year as "publishYear"`,
        [id, title, author, isbn, publishYear]
      );

      if (rows.length === 0) {
        return callback({
          code: Status.NOT_FOUND,
          message: `Book with id ${id} not found`,
        });
      }

      callback(null, rows[0]);
    } catch (error: any) {
      if (error.constraint === 'books_isbn_key') {
        return callback({
          code: Status.ALREADY_EXISTS,
          message: 'Book with this ISBN already exists',
        });
      }

      callback({
        code: Status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  async DeleteBook(call: ServerUnaryCall<DeleteBookRequest, DeleteBookResponse>, callback: sendUnaryData<DeleteBookResponse>) {
    try {
      const { id } = call.request;
      const { rowCount } = await this.fastify.pg.query(
        'DELETE FROM books WHERE id = $1',
        [id]
      );

      if (rowCount === 0) {
        return callback({
          code: Status.NOT_FOUND,
          message: `Book with id ${id} not found`,
        });
      }

      callback(null, { success: true });
    } catch (error) {
      callback({
        code: Status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }
}
