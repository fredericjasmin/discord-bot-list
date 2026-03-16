const app = require("./server/express");
const database = require('./database')
require("./server/bot");

app.listen(app.get("port"), () => {
  console.log("Pagina prendido");
});
