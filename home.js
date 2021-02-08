var mongoose = require("mongoose");
var express = require("express");
var serveStatic = require("serve-static");

var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 3000;
const HOSTNAME = "127.0.0.1";

// Routes
// var book_routes = require("./routes/book_routes");
// var user_routes = require("./routes/user_routes");
// var issue_routes = require("./routes/issue_routes");

mongoose.connect("mongodb://localhost:27017/library");

app.use(serveStatic("public", { index: ["home.html"] }));

// app.use("/book", book_routes);
// app.use("user", user_routes);
// app.use("/user", issue_routes);

app.listen(PORT, HOSTNAME, function () {
  console.log(`Running on Port: ${PORT}`);
});
// console.log("Hello");
