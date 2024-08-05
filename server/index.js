/* server/index.js */

const express = require("express");
const algo = require("./algo.js");

const PORT = 3000;

const app = express();

app.get("/api", (req, res) => {
  res.json({ message: algo.getRoute(50, 50, 5000)});
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
