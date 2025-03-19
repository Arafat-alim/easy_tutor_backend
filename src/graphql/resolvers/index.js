const axios = require("axios");

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

console.log("🚀 ~ GOOGLE_BOOK_API_KEY:", GOOGLE_BOOKS_API_KEY);

const GOOGLE_BOOKS_API = process.env.GOOGLE_BOOKS_API;
console.log("🚀 ~ GOOGLE_BOOKS_API:", GOOGLE_BOOKS_API);

const resolvers = {
  searchBooks: async ({ query, limit, offset }) => {
    try {
      const response = await axios.get(
        `${GOOGLE_BOOKS_API}/volumes?q=${query}&maxResults=${limit}&startIndex=${offset}&key=${GOOGLE_BOOKS_API_KEY}`
      );

      return response.data.items.map((item) => ({
        id: item.id,
        volumeInfo: {
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || [],
          publisher: item.volumeInfo.publisher || "",
          publishedDate: item.volumeInfo.publishedDate || "",
          description: item.volumeInfo.description || "",
          industryIdentifiers: item.volumeInfo.industryIdentifiers || [],
          imageLinks: item.volumeInfo.imageLinks || { thumbnail: "" },
          language: item.volumeInfo.language || "",
        },
        saleInfo: {
          country: item.saleInfo?.country || "IN",
          saleability: item.saleInfo?.saleability || "",
          listPrice: item.saleInfo?.listPrice || {
            amount: 0,
            currencyCode: "",
          },
          buyLink: item.saleInfo?.buyLink || "",
        },
        accessInfo: {
          country: item.accessInfo?.country || "IN",
          epub: {
            isAvailable: item.accessInfo?.epub?.isAvailable || false,
          },
          pdf: {
            isAvailable: item.accessInfo?.pdf?.isAvailable || false,
          },
          webReaderLink: item.accessInfo?.webReaderLink || "",
        },
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  getBookById: async ({ bookId }) => {
    try {
      const response = await axios.get(
        `${GOOGLE_BOOKS_API}/volumes/${bookId}?key=${API_KEY}`
      );
      const item = response.data;
      return {
        id: item.id,
        volumeInfo: {
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || [],
          publisher: item.volumeInfo.publisher || "",
          publishedDate: item.volumeInfo.publishedDate || "",
          description: item.volumeInfo.description || "",
          industryIdentifiers: item.volumeInfo.industryIdentifiers || [],
          imageLinks: item.volumeInfo.imageLinks || { thumbnail: "" },
          language: item.volumeInfo.language || "",
        },
        saleInfo: {
          country: item.saleInfo?.country || "IN",
          saleability: item.saleInfo?.saleability || "",
          listPrice: item.saleInfo?.listPrice || {
            amount: 0,
            currencyCode: "",
          },
          buyLink: item.saleInfo?.buyLink || "",
        },
        accessInfo: {
          country: item.accessInfo?.country || "IN",
          epub: {
            isAvailable: item.accessInfo?.epub?.isAvailable || false,
          },
          pdf: {
            isAvailable: item.accessInfo?.pdf?.isAvailable || false,
          },
          webReaderLink: item.accessInfo?.webReaderLink || "",
        },
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};

module.exports = resolvers;
