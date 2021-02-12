var express = require("express");
var router = express.Router();
var multer = require("multer");
var Author = require("./../models/author");
var path = require("path");
const bcrypt = require("bcrypt");
require("dotenv/config");

const Storage = multer.diskStorage({
  destination: "./public/uploads/profile/author/",
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
}).single("profileImage");

router.get("/", async (req, res) => {
  let searchOptions = {};

  if (req.query.authorName !== null && req.query.authorName !== "") {
    searchOptions.authorName = new RegExp(req.query.authorName, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("containers/authors/authorIndex", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

router.get("/signup", (req, res) => {
  res.render("containers/authors/authorSignUp", { author: new Author() });
});

router.post("/signup", upload, async function (req, res) {
  if (!(req.body.email && req.body.password)) {
    return res.status(400).send({ error: "Data not formatted properly" });
  }

  var user = new Author({
    authorName: req.body.authorName,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    profileImage: req.file.filename,
    profileImagePath: "profile/author/" + req.file.filename,
  });

  // generate salt to hash password
  const SALT = await bcrypt.genSalt(10);
  // now we set user password to hashed password
  user.password = await bcrypt.hash(user.password, SALT);

  user.save(function (err) {
    if (err) {
      return res.send(err);
    }
    res.send({ message: "Author Added Successfully!!" });
  });
});

router.get("/signin", (req, res) => {
  res.render("containers/authors/authorLogin", { author: new Author() });
});

router.post("/signin", async function (req, res) {
  if (!(req.body.email && req.body.password)) {
    return res.status(400).send({ error: "Data not formatted properly" });
  }

  const body = req.body;
  const user = await Author.findOne({ email: body.email }).catch((err) =>
    res.send({ error: "Error Logging In!", errorMessage: err })
  );

  if (user) {
    // check user password with hashed password stored in the database
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (validPassword) {
      res.status(200).json({ message: "Valid password" });
    } else {
      res.status(400).json({ error: "Invalid Password" });
    }
  } else {
    res.status(401).json({ error: "User does not exist" });
  }
});

router.get("/:id", (req, res) => {
  Author.findById(req.params.id, (err, author) => {
    if (err) {
      return res.send({ error: err });
    }
    if (author !== null) res.send({ author: author });
    else res.send({ error: "No Author Found of this ID!" });
  });
});

router.post("/:id/update", function (req, res) {
  Author.findById(req.params.id, function (err, user) {
    if (err) {
      return res.send(err);
    }
    for (prop in req.body) {
      user[prop] = req.body[prop];
    }
    user.save(function (err) {
      if (err) {
        return res.send(err);
      }
      res.send({ message: "Author Updated Successfully!!" });
    });
  });
});

router.delete("/:id/delete", (req, res) => {
  const userId = req.params.id;
  User.findOneAndRemove(userId)
    .exec()
    .then((doc) => {
      if (!doc) return res.status(404).end();
      return res.send({ message: "User Deleted!!" });
    })
    .catch((err) => {
      return res.send({ error: err });
    });
});

function resCb(err, data) {
  if (err) this.res.send(err);
  this.res.json(data);
}

module.exports = router;
