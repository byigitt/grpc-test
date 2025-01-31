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

  private validateBook(data: Partial<Book>) {
    const errors: string[] = [];

    if (data.title && (data.title.length < 1 || data.title.length > 255)) {
      errors.push('Title must be between 1 and 255 characters');
    }

    if (data.author && (data.author.length < 1 || data.author.length > 255)) {
      errors.push('Author must be between 1 and 255 characters');
    }

    if (data.isbn && !/^\d{13}$/.test(data.isbn)) {
      errors.push('ISBN must be exactly 13 digits');
    }

    const currentYear = new Date().getFullYear();
    if (data.publishYear && (data.publishYear < 1000 || data.publishYear > currentYear)) {
      errors.push(`Publish year must be between 1000 and ${currentYear}`);
    }

    return errors;
  }

  private handleDatabaseError(error: any, callback: sendUnaryData<any>) {
    this.fastify.log.error(error);

    if (error.constraint === 'books_isbn_key') {
      return callback({
        code: Status.ALREADY_EXISTS,
        message: 'Book with this ISBN already exists',
      });
    }

    if (error.code === '23505') { // Unique violation
      return callback({
        code: Status.ALREADY_EXISTS,
        message: 'Duplicate entry found',
      });
    }

    if (error.code === '23503') { // Foreign key violation
      return callback({
        code: Status.FAILED_PRECONDITION,
        message: 'Referenced record does not exist',
      });
    }

    callback({
      code: Status.INTERNAL,
      message: 'Internal server error',
    });
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
      const bookData = call.request;
      const validationErrors = this.validateBook(bookData);

      if (validationErrors.length > 0) {
        return callback({
          code: Status.INVALID_ARGUMENT,
          message: validationErrors.join(', '),
        });
      }

      const { rows } = await this.fastify.pg.query<Book>(
        `INSERT INTO books (title, author, isbn, publish_year) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, title, author, isbn, publish_year as "publishYear"`,
        [bookData.title, bookData.author, bookData.isbn, bookData.publishYear]
      );

      callback(null, rows[0]);
    } catch (error) {
      this.handleDatabaseError(error, callback);
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
      const bookData = call.request;
      const validationErrors = this.validateBook(bookData);

      if (validationErrors.length > 0) {
        return callback({
          code: Status.INVALID_ARGUMENT,
          message: validationErrors.join(', '),
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
        [bookData.id, bookData.title, bookData.author, bookData.isbn, bookData.publishYear]
      );

      if (rows.length === 0) {
        return callback({
          code: Status.NOT_FOUND,
          message: `Book with id ${bookData.id} not found`,
        });
      }

      callback(null, rows[0]);
    } catch (error) {
      this.handleDatabaseError(error, callback);
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
