var express = require("express");
var router = express.Router();
const { dbg } = require("../local_utils");
const alert = require("alert");
const User = require("../models/users");
const Transaction = require("../models/users");
const mongoose = require("mongoose")

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
  sess = req.session;
  if (typeof sess.username == "undefined") { res.redirect("/"); }
  console.log(req.session.userId)
  const perTran = 10;
  const page = req.query.page;

  Transaction.find({
    $or: [
      {
        userId: { $elemMatch: { id: mongoose.Types.ObjectId(req.session.userId) } },
      }
    ],
  })
    .sort({ date: -1 })
    .skip(perTran * page - perTran)
    .limit(perTran)
    .lean()
    .exec(function (e, pendlist) {
      Transaction.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        } else {
          res.render("user/history", {
            layout: "user/dashboard", full_name: req.session.full_name,
            email: req.session.email, layout: "user/dashboard",
            pagination: {
              page: req.query.page || 1,
              pageCount: Math.ceil(count / perTran),
            },
            pendlist,
          });
        }
      });
    });

});

router.get("/profile", (req, res, next) => {
  sess = req.session;
  if (typeof sess.username == "undefined") { res.redirect("/"); }
  console.log(req.session.email)
  User.findOne({ email: req.session.email }, (e, user) => {
    if (e) {
      console.log(e);
      return res.sendStatus(500)
    }
    if (user) {
      return res.render("user/profile", {
        profile: user, full_name: req.session.full_name,
        email: req.session.email, layout: "user/dashboard"
      })
    }
  })
})
module.exports = router;
