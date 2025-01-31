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

/**
 * Service handling gRPC operations for the Book entity.
 * Implements CRUD operations and listing functionality for books.
 * 
 * @example
 * const bookService = new BookService(fastify);
 */
export class BookService implements grpc.UntypedServiceImplementation {
  [key: string]: any;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Validates book data against business rules
   * @param data - Partial book data to validate
   * @returns Array of validation error messages, empty if valid
   */
  private validateBook(data: Partial<Book>): string[] {
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

  /**
   * Handles database errors and converts them to appropriate gRPC status codes
   * @param error - The caught database error
   * @param callback - gRPC callback function to send the response
   */
  private handleDatabaseError(error: any, callback: sendUnaryData<any>): void {
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

  /**
   * Retrieves a single book by its ID
   * @param call - gRPC call object containing the book ID
   * @param callback - Function to send the response
   * @throws {Status.NOT_FOUND} When book doesn't exist
   * @throws {Status.INTERNAL} On database errors
   * 
   * @example
   * // Request:
   * {
   *   "id": 1
   * }
   * 
   * // Success Response:
   * {
   *   "id": 1,
   *   "title": "The Great Gatsby",
   *   "author": "F. Scott Fitzgerald",
   *   "isbn": "9780743273565",
   *   "publishYear": 1925
   * }
   * 
   * // Error Response (Not Found):
   * {
   *   "code": 5,
   *   "message": "Book not found"
   * }
   */
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

  /**
   * Creates a new book
   * @param call - gRPC call object containing the book data
   * @param callback - Function to send the response
   * @throws {Status.INVALID_ARGUMENT} When validation fails
   * @throws {Status.ALREADY_EXISTS} When ISBN is duplicate
   * @throws {Status.INTERNAL} On database errors
   * 
   * @example
   * // Request:
   * {
   *   "title": "The Great Gatsby",
   *   "author": "F. Scott Fitzgerald",
   *   "isbn": "9780743273565",
   *   "publishYear": 1925
   * }
   * 
   * // Success Response:
   * {
   *   "id": 1,
   *   "title": "The Great Gatsby",
   *   "author": "F. Scott Fitzgerald",
   *   "isbn": "9780743273565",
   *   "publishYear": 1925
   * }
   * 
   * // Error Response (Validation):
   * {
   *   "code": 3,
   *   "message": "ISBN must be exactly 13 digits"
   * }
   */
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

  /**
   * Retrieves a paginated list of books
   * @param call - gRPC call object containing pagination parameters
   * @param callback - Function to send the response
   * @throws {Status.INTERNAL} On database errors
   * 
   * @example
   * // Request:
   * {
   *   "page": 1,
   *   "limit": 10
   * }
   * 
   * // Success Response:
   * {
   *   "books": [
   *     {
   *       "id": 1,
   *       "title": "The Great Gatsby",
   *       "author": "F. Scott Fitzgerald",
   *       "isbn": "9780743273565",
   *       "publishYear": 1925
   *     }
   *   ],
   *   "total": 1
   * }
   */
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

  /**
   * Updates an existing book
   * @param call - gRPC call object containing the book data
   * @param callback - Function to send the response
   * @throws {Status.NOT_FOUND} When book doesn't exist
   * @throws {Status.INVALID_ARGUMENT} When validation fails
   * @throws {Status.ALREADY_EXISTS} When ISBN is duplicate
   * @throws {Status.INTERNAL} On database errors
   * 
   * @example
   * // Request:
   * {
   *   "id": 1,
   *   "title": "Updated Title",
   *   "author": "Updated Author",
   *   "isbn": "9780743273565",
   *   "publishYear": 1925
   * }
   * 
   * // Success Response:
   * {
   *   "id": 1,
   *   "title": "Updated Title",
   *   "author": "Updated Author",
   *   "isbn": "9780743273565",
   *   "publishYear": 1925
   * }
   * 
   * // Error Response (Not Found):
   * {
   *   "code": 5,
   *   "message": "Book with id 1 not found"
   * }
   */
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

  /**
   * Deletes a book by its ID
   * @param call - gRPC call object containing the book ID
   * @param callback - Function to send the response
   * @throws {Status.NOT_FOUND} When book doesn't exist
   * @throws {Status.INTERNAL} On database errors
   * 
   * @example
   * // Request:
   * {
   *   "id": 1
   * }
   * 
   * // Success Response:
   * {
   *   "success": true
   * }
   * 
   * // Error Response (Not Found):
   * {
   *   "code": 5,
   *   "message": "Book with id 1 not found"
   * }
   */
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
