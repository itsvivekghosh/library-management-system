const express = require("express");
const Book = require("../models/books");
const Admin = require("../models/admin");
const multer = require("multer");
const bcrypt = require("bcrypt");
const path = require("path");
const router = express.Router();

const Storage = multer.diskStorage({
  destination: "./public/uploads/profile/admin/",
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
}).single("adminProfileImage");

router.get("/", async (req, res) => {
  let query = Book.find({ issued: true });
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  try {
    const books = await query.exec();
    res.render("containers/admins/adminBooksIndexView", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

router.get("/signup", async (req, res) => {
  res.render("containers/admins/adminSignUp", { admin: new Admin() });
});

router.post("/signup", upload, async function (req, res) {
  if (!(req.body.email && req.body.password)) {
    return res.status(400).send({ error: "Data not formatted properly" });
  }

  var user = new Admin({
    adminName: req.body.adminName,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    adminProfileImage: req.file.filename,
    adminProfileImagePath: "profile/admin/" + req.file.filename,
  });

  // generate salt to hash password
  const SALT = await bcrypt.genSalt(10);
  // now we set user password to hashed password
  user.password = await bcrypt.hash(user.password, SALT);

  user.save(function (err) {
    if (err) {
      return res.send(err);
    }
    res.send({ message: "Admin Added Successfully!!" });
  });
});

router.get("/signin", async (req, res) => {
  res.render("containers/admins/adminSignIn", { admin: new Admin() });
});

router.post("/signin", async function (req, res) {
  if (!(req.body.email && req.body.password)) {
    return res.status(400).send({ error: "Data not formatted properly" });
  }

  const body = req.body;
  const admin = await Admin.findOne({ email: body.email }).catch((err) =>
    res.send({ error: "Error Logging In!", errorMessage: err })
  );

  if (admin) {
    // check admin password with hashed password stored in the database
    const validPassword = await bcrypt.compare(body.password, admin.password);
    if (validPassword) {
      res.status(200).json({ message: "Valid password" });
    } else {
      res.status(400).json({ error: "Invalid Password" });
    }
  } else {
    res.status(401).json({ error: "User does not exist" });
  }
});

module.exports = router;
