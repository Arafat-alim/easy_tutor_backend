const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type IndustryIdentifier {
    type: String
    identifier: String
  }

  type ImageLinks {
    thumbnail: String
  }

  type ListPrice {
    amount: Float
    currencyCode: String
  }

  type SaleInfo {
    country: String
    saleability: String
    listPrice: ListPrice
    buyLink: String
  }

  type Epub {
    isAvailable: Boolean
  }

  type Pdf {
    isAvailable: Boolean
  }

  type AccessInfo {
    country: String
    epub: Epub
    pdf: Pdf
    webReaderLink: String
  }

  type VolumeInfo {
    title: String
    authors: [String]
    publisher: String
    publishedDate: String
    description: String
    industryIdentifiers: [IndustryIdentifier]
    imageLinks: ImageLinks
    language: String
  }

  type Book {
    id: String
    volumeInfo: VolumeInfo
    saleInfo: SaleInfo
    accessInfo: AccessInfo
  }

  type Query {
    searchBooks(query: String!, limit: Int!, offset: Int!): [Book]
    getBookById(bookId: String!): Book
  }
`);

module.exports = schema;
