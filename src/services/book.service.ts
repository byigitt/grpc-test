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

  async getBook(call: ServerUnaryCall<GetBookRequest, Book>, callback: sendUnaryData<Book>) {
    try {
      const { id } = call.request;
      const { rows } = await this.fastify.pg.query(
        'SELECT * FROM books WHERE id = $1',
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

  async createBook(call: ServerUnaryCall<CreateBookRequest, Book>, callback: sendUnaryData<Book>) {
    try {
      const { title, author, isbn, publishYear } = call.request;
      const { rows } = await this.fastify.pg.query(
        'INSERT INTO books (title, author, isbn, publishYear) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, author, isbn, publishYear]
      );

      callback(null, rows[0]);
    } catch (error) {
      callback({
        code: 13,
        message: 'Internal server error'
      });
    }
  }

  async listBooks(call: ServerUnaryCall<ListBooksRequest, ListBooksResponse>, callback: sendUnaryData<ListBooksResponse>) {
    try {
      const { page = 1, limit = 10 } = call.request;
      const offset = (page - 1) * limit;

      const { rows: books } = await this.fastify.pg.query(
        'SELECT * FROM books ORDER BY id LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      const { rows: [{ count }] } = await this.fastify.pg.query(
        'SELECT COUNT(*) FROM books'
      );

      callback(null, { books, total: parseInt(count) });
    } catch (error) {
      callback({
        code: 13,
        message: 'Internal server error'
      });
    }
  }

  async updateBook(call: ServerUnaryCall<UpdateBookRequest, Book>, callback: sendUnaryData<Book>) {
    try {
      const { id, title, author, isbn, publishYear } = call.request;
      const { rows } = await this.fastify.pg.query(
        `UPDATE books 
         SET title = COALESCE($2, title),
             author = COALESCE($3, author),
             isbn = COALESCE($4, isbn),
             publishYear = COALESCE($5, publishYear),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, title, author, isbn, publishYear]
      );

      if (rows.length === 0) {
        return callback({
          code: 5,
          message: `Book with id ${id} not found`
        });
      }

      callback(null, rows[0]);
    } catch (error) {
      callback({
        code: 13,
        message: 'Internal server error'
      });
    }
  }

  async deleteBook(call: ServerUnaryCall<DeleteBookRequest, DeleteBookResponse>, callback: sendUnaryData<DeleteBookResponse>) {
    try {
      const { id } = call.request;
      const { rowCount } = await this.fastify.pg.query(
        'DELETE FROM books WHERE id = $1',
        [id]
      );

      if (rowCount === 0) {
        return callback({
          code: 5,
          message: `Book with id ${id} not found`
        });
      }

      callback(null, { success: true });
    } catch (error) {
      callback({
        code: 13,
        message: 'Internal server error'
      });
    }
  }
}
