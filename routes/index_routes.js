const express = require("express");
const Author = require("../models/author");
const Book = require("../models/books");

const router = express.Router();

router.get("/", async (req, res) => {
  let books, authors;
  try {
    books = await Book.find().sort({ createdAt: "desc" }).limit(10).exec();
    authors = await Author.find().sort({ createdAt: "desc" }).limit(10).exec();
  } catch {
    books = [];
    authors = [];
  }
  res.render("home.ejs", {
    books: books,
    authors: authors,
  });
});

module.exports = router;
