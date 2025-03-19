const express = require("express");

const schema = require("./schema");
const resolvers = require("./resolvers");
const { createHandler } = require("graphql-http/lib/use/express");

const graphqlRoute = express.Router();

graphqlRoute.use(
  "/graphql",
  createHandler({
    schema,
    rootValue: resolvers,
  })
);

module.exports = graphqlRoute;
