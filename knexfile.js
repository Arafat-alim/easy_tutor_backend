require("dotenv").config();
const path = require("path");

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.MYSQL_DB_HOST,
      user: process.env.MYSQL_DB_USER,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
      port: process.env.MYSQL_DB_PORT,
      //   ssl: {
      //     rejectUnauthorized: false,
      //   },
    },
    migrations: {
      directory: path.resolve(__dirname, "src/migrations"), // Use absolute path
    },
    seeds: {
      directory: path.resolve(__dirname, "src/seeds"), // Use absolute path
    },
    // useNullAsDefault: true,
  },
};
