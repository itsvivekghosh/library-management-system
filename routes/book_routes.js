var express = require("express");
const multer = require("multer");
var router = express.Router();
var Book = require("../models/books");
var Author = require("../models/author");
var path = require("path");

router.get("/", async (req, res) => {
  let query = Book.find().sort({ createdAt: -1 });

  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("containers/books/bookIndex", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// New Book Route
router.get("/add", (_, res) => {
  renderNewPage(res, new Book());
});

const Storage = multer.diskStorage({
  destination: "./public/uploads/covers/",
  // By default, multer removes file extensions so let's add them back
  filename: function (_, file, cb) {
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
    description: req.body.description,
    publishDate: req.body.publishDate,
    pagesCounts: req.body.pagesCounts,
    isbn: req.body.isbn,
    coverPath: "covers/" + req.file.filename,
    coverName: req.file.filename,
  });
  book.save(function (error) {
    if (error) {
      return res.send(error);
    }
    Author.findById(req.body.author, function (err, author) {
      if (err) {
        return res.send({ error: "Author Not Found!" });
      }
      author["noOfBooks"] += 1;

      author.save(function (err) {
        if (err) {
          return res.send(err);
        }
      });
    });
    res.send({ message: "Book Added Successfully!!" });
  });
});

router.get("/:id", function (req, res) {
  Book.findById(req.params.id, async (err, book) => {
    if (err) {
      res.render("containers/layouts/errorPage", {
        errorMessage: "No Book Found",
        statusMessage: 404,
      });
    }
    const author = await Author.findById(book.author);
    const moreBooks = await Book.find({
      author: book.author,
      _id: { $ne: req.params.id },
    })
      .limit(4)
      .sort({ createdAt: -1 });
    if (book !== null)
      res.render("containers/books/bookDetails", {
        book: book,
        bookAuthor: author,
        moreBooks: moreBooks,
      });
  }).catch((err) => console.log(err));
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

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      if (form === "editBook") {
        params.errorMessage = "Error Updating Book";
      } else {
        params.errorMessage = "Error Creating Book";
      }
    }
    res.render(`containers/books/${form}`, params);
  } catch {
    res.redirect("/book");
  }
}

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "createBook", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "editBook", hasError);
}

module.exports = router;
