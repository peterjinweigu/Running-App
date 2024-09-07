/* server/index.js */

const express = require("express");
const algo = require("./algo.js");
const cors = require("cors");

const PORT = 3000;

const app = express();

app.use(cors({origin:true, credentials:true}));

app.get("/api/:lat/:long/:distance", async (req, res) => {
  var lat = parseFloat(req.params.lat);
  var long = parseFloat(req.params.long);
  var distance = parseFloat(req.params.distance);
  
  const pts = await algo.getRoute(lat, long, distance);

  res.json({embed: algo.getEmbed(pts)});
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
