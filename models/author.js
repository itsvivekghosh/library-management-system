var mongoose = require("mongoose");

var authorSchema = new mongoose.Schema({
  authorName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: false,
  },
  profileImagePath: {
    type: String,
  },
  noOfBooks: {
    type: String,
    default: 0,
    required: false,
  },
});

authorSchema.statics.findByUsername = function (username, callback) {
  return this.find({ username: username }, callback);
};

authorSchema.statics.findByEmail = function (email, callback) {
  return this.find({ email: email }, callback);
};

authorSchema.statics.findByName = function (name, callback) {
  return this.find({ name: new RegExp(name, "gi") }, callback);
};

authorSchema.statics.login = function (username, password, callback) {
  return this.find({ username: username, password: password }, callback);
};

var Author = mongoose.model("Author", authorSchema);
module.exports = Author;
