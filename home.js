var mongoose = require("mongoose");
var express = require("express");
var serveStatic = require("serve-static");
require("dotenv/config");

var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 3000;

// Routes
var book_routes = require("./routes/book_routes");
var user_routes = require("./routes/user_routes");
var issue_routes = require("./routes/issue_routes");

// connecting to mongoose mongodb
mongoose.connect(process.env.MONGO_URL);

app.use(serveStatic("public", { index: ["home.html"] }));

app.use("/book", book_routes);
app.use("/user", user_routes);
app.use("/issue", issue_routes);

app.listen(PORT, function () {
  console.log(
    `Running on Port: ${
      process.env.PORT || PORT
    }, \nPlease Click: http://localhost:3000/`
  );
});
