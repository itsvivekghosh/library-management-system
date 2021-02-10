var mongoose = require("mongoose");
require("dotenv/config");

mongoose.connect("mongodb://localhost/library");
var conn = mongoose.Collection;

var uploadCoverSchema = new mongoose.Schema({
  imageName: { type: String },
  isbn: { type: String },
});

var uploadModel = mongoose.model("uploadCover", uploadCoverSchema);
module.exports = uploadModel;
