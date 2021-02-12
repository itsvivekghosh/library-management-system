var express = require("express");
const multer = require("multer");
var router = express.Router();
var Book = require("../models/books");
var path = require("path");

router.get("/", function (req, res) {
  var query = req.query;
  var cb = resCb.bind({ res: res });
  if (query.hasOwnProperty("title")) {
    Book.findByTitle(query.title, cb);
  } else if (query.hasOwnProperty("author")) {
    Book.findByAuthor(query.author, cb);
  } else if (query.hasOwnProperty("isbn")) {
    Book.findByIsbn(query.isbn, cb);
  } else if (query.hasOwnProperty("issued")) {
    Book.findByIssued(query.issued, cb);
  } else {
    Book.find(cb);
  }
});

router.get("/:id", function (req, res) {
  Book.findById(req.params.id, resCb.bind({ res: res }));
});

const Storage = multer.diskStorage({
  destination: "./public/uploads/covers/",
  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  fileFilter: imageFilter,
  storage: Storage,
  limits: { fileSize: 1000000 },
}).single("cover");

router.post("/add", upload, function (req, res) {
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    coverPath: "covers/" + req.file.filename,
    coverName: req.file.filename,
    issued: req.body.issued,
  });
  book.save(function (error) {
    if (error) {
      return res.send(error);
    }
    res.send({ message: "Book Added Successfully!!" });
  });
});

router.post("/:id", function (req, res) {
  Book.findById(req.params.id, function (error, book) {
    if (error) {
      return res.send(error);
    }

    for (prop in req.body) {
      book[prop] = req.body[prop];
    }

    book.save(function (err) {
      if (err) {
        return res.send(err);
      }
      res.send({ message: "Book Updated!!" });
    });
  });
});

router.delete("/:id/delete/", (req, res) => {
  const bookId = req.params.id;
  Book.findOneAndRemove(bookId)
    .exec()
    .then((doc) => {
      if (!doc) return res.status(404).end();
      return res.send({ message: "Book Deleted!!" });
    })
    .catch((err) => {
      return res.send({ error: err });
    });
});

function resCb(err, data) {
  if (err) {
    this.res.send(err);
  }
  this.res.json(data);
}

function transferMessage(res, message) {
  return { res: message };
}

module.exports = router;
