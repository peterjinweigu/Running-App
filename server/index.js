/* server/index.js */

const express = require("express");
const algo = require("./algo.js");

const PORT = 3000;

const app = express();

app.get("/api", (req, res) => {
  algo.getRoute(43.47389747055288, -80.54434334162293, 1000).then(data => {
    // res.send(data);
  })
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
