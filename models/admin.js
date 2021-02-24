var mongoose = require("mongoose");

var adminSchema = new mongoose.Schema({
  adminName: {
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
  adminProfileImage: {
    type: String,
    required: false,
  },
  adminProfileImagePath: {
    type: String,
  },
});

adminSchema.statics.findByUsername = function (username, callback) {
  return this.find({ username: username }, callback);
};

adminSchema.statics.findByEmail = function (email, callback) {
  return this.find({ email: email }, callback);
};

adminSchema.statics.findByName = function (name, callback) {
  return this.find({ name: new RegExp(name, "gi") }, callback);
};

adminSchema.statics.login = function (username, password, callback) {
  return this.find({ username: username, password: password }, callback);
};

var Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
