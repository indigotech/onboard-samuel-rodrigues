const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const express = require("express");
const app = express();
const port = 4000;

const schema = buildSchema(`
    type Query {
        hello: String,
        name: String,
    }
`);

const rootValue = {
  hello: () => {
    return "Hello World!";
  },
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  })
);

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
