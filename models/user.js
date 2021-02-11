var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  name: {
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
});

userSchema.statics.findByUsername = function (username, callback) {
  return this.find({ username: username }, callback);
};

userSchema.statics.findByEmail = function (email, callback) {
  return this.find({ email: email }, callback);
};

userSchema.statics.findByName = function (name, callback) {
  return this.find({ name: new RegExp(name, "gi") }, callback);
};

userSchema.statics.login = function (username, password, callback) {
  return this.find({ username: username, password: password }, callback);
};

var User = mongoose.model("User", userSchema);

module.exports = User;
