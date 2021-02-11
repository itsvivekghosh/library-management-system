var express = require("express");
var router = express.Router();
var multer = require("multer");
var User = require("./../models/user");
var path = require("path");

const Storage = multer.diskStorage({
  destination: "./public/uploads/profile/",
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

router.get("/", function (req, res) {
  var query = req.query;
  var cb = resCb.bind({ res: res });
  if (query.hasOwnProperty("name")) {
    User.findByName(query.name, cb);
  } else if (query.hasOwnProperty("username")) {
    User.findByUsername(query.username, cb);
  } else {
    User.find(cb);
  }
});

router.post("/login", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var cb = resCb.bind({ res: res });
  console.log(User.login(username, password, cb));
});

router.post("/signup", upload, function (req, res) {
  var user = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    profileImage: req.file.filename,
    profileImagePath: "profile/" + req.file.filename,
  });
  user.save(function (err) {
    if (err) {
      return res.send(err);
    }
    res.send({ message: "User Added!!" });
  });
});

router.post("/:id", function (req, res) {
  User.findById(req.params.id, function (err, user) {
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
      res.send({ message: "User Updated!!" });
    });
  });
});

router.delete("/:id/delete/", (req, res) => {
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

function errorMessage(message) {
  return { error: message };
}

module.exports = router;
