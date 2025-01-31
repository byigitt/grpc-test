// Original file: src/proto/book.proto


export interface CreateBookRequest {
  'title'?: (string);
  'author'?: (string);
  'isbn'?: (string);
  'publishYear'?: (number);
}

export interface CreateBookRequest__Output {
  'title': (string);
  'author': (string);
  'isbn': (string);
  'publishYear': (number);
}
