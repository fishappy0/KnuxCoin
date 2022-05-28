var express = require("express");
var router = express.Router();
const { dbg } = require("../local_utils");
const alert = require("alert");
const User = require("../models/users");

/* GET users listing. */
router.get("/", function (req, res, next) {
  sess = req.session;
  if (typeof sess.username != "undefined") {
    if (sess.first_time == true) {
      res.render("account/password", { error: "Please change your password before using the system!" })
    } else
      res.render("user/dashboard", {
        full_name: req.session.full_name,
        email: req.session.email,
      });
  } else {
    res.redirect("/");
  }
});
router.post("/", (req, res, next) => { });

router.get("/history", (req, res, next) => {
  // sess = req.session;
  // if (typeof sess.username == "undefined") { res.redirect("/"); }
  res.render("user/history", { layout: "user/dashboard" });
});

router.get("/profile", (req, res, next) => {
  // sess = req.session;
  // if (typeof sess.username == "undefined") { res.redirect("/"); }
  console.log(req.session.email)
  // User.findOne({ email: req.session.email }, (e, user) => {
  //   if (e) {
  //     console.log(e);
  //     return res.sendStatus(500)
  //   }
  //   if (user) {
      return res.render("user/profile", { /*profile: user,*/ layout: "user/dashboard" })
  //   }
  // })
})
module.exports = router;
