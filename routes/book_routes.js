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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

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

router.post("/", function (req, res) {
  var book = new Book(req.body);
  book.save(function (error) {
    if (error) {
      return res.send(error);
    }
    res.send({ message: "Book Added Successfully!!" });
  });
});

const upload = multer({
  dest: "uploads/",
  fileFilter: imageFilter,
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("cover");

router.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send("Something went wrong!");
    }
    res.send(req.file);
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
