if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: ".env" });
}

var mongoose = require("mongoose");
var express = require("express");
var expressLayout = require("express-ejs-layouts");
var methodOverride = require("method-override");
var bodyparser = require("body-parser");

var router = express.Router();

router.use(express.static(__dirname + "./public/"));
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", __dirname + "/public");
app.use(methodOverride("_method"));
app.set("layout", "layouts/layout");

app.use(expressLayout);
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ limit: "10mb", extended: false }));

// Routes
var book_routes = require("./routes/book_routes");
var user_routes = require("./routes/user_routes");
var issue_routes = require("./routes/issue_routes");
var author_routes = require("./routes/author_routes");
var index_routes = require("./routes/index_routes");

// connecting to mongoose mongodb
mongoose
  .connect(process.env.MONGO_URL + process.env.DATABASE_NAME, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log(`Connected to Database: ${process.env.DATABASE_NAME}`);
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/", index_routes);
app.use("/book", book_routes);
app.use("/user", user_routes);
app.use("/author", author_routes);
app.use("/issue", issue_routes);

app.listen(PORT, () => {
  console.log(
    `Running on Port: ${
      process.env.PORT || PORT
    }, \nPlease Click: http://localhost:3000/`
  );
});

// end -- of -- file
