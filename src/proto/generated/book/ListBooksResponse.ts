// Original file: src/proto/book.proto

import type { Book as _book_Book, Book__Output as _book_Book__Output } from '../book/Book';

export interface ListBooksResponse {
  'books'?: (_book_Book)[];
  'total'?: (number);
}

export interface ListBooksResponse__Output {
  'books': (_book_Book__Output)[];
  'total': (number);
}
