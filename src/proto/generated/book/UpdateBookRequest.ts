// Original file: src/proto/book.proto


export interface UpdateBookRequest {
  'id'?: (number);
  'title'?: (string);
  'author'?: (string);
  'isbn'?: (string);
  'publishYear'?: (number);
}

export interface UpdateBookRequest__Output {
  'id': (number);
  'title': (string);
  'author': (string);
  'isbn': (string);
  'publishYear': (number);
}
