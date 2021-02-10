var mongoose = require("mongoose");

var bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    default: "Not Available",
  },
  issued: {
    type: Boolean,
    required: false,
  },
  cover: {
    type: Buffer,
    contentType: String,
  },
});

bookSchema.statics.findByTitle = function (title, callback) {
  return this.find(
    {
      title: new RegExp(title, "gi"),
    },
    callback
  );
};

bookSchema.statics.findByAuthor = function (author, callback) {
  return this.find(
    {
      author: new RegExp(author, "gi"),
    },
    callback
  );
};

bookSchema.statics.findByIsbn = function (isbn, callback) {
  return this.find(
    {
      isbn: isbn,
    },
    callback
  );
};

bookSchema.statics.findByIssue = function (issued, callback) {
  return this.find(
    {
      issued: issued,
    },
    callback
  );
};

var Book = mongoose.model("Book", bookSchema);
module.exports = Book;
