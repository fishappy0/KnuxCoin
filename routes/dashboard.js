var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Transaction = require("../models/transaction.js");
const mongoose = require("mongoose")

/* GET users listing. */
router.get("/", async function (req, res, next) {
  sess = req.session;
  if (typeof sess.username != "undefined") {
    if (sess.first_time == true) {
      res.render("account/password", { error: "Please change your password before using the system!" })
    } else {
      let userstatus = await User.getUserStatus(req.session.username);
      if (userstatus == "waiting") userstatus = "updateID";
      console.log(userstatus);
      res.render("user/welcome", {
        layout: 'user/dashboard',
        full_name: req.session.full_name,
        email: req.session.email,
        accountStatus: (userstatus == "updateID") ? "updateID" : null,
      });
    }
  } else {
    res.redirect("/");
  }
});
router.post("/", (req, res, next) => { });

//Trang lịch sử giao dịch
router.get("/history", (req, res, next) => {
  sess = req.session;
  if (typeof sess.username == "undefined") { res.redirect("/"); }
  console.log(req.session.userId)


  User.findOne({ _id: mongoose.Types.ObjectId(req.session.userId) }, (e, user) => {
    if (user.status == "unapproved" || user.status == "waiting") {
      res.render("user/history", {
        layout: "user/dashboard",
        full_name: req.session.full_name,
        email: req.session.email,
        error: "This feature is only for verified accounts."
      });
    } else {
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
        .exec(function (e, transaction) {
          Transaction.countDocuments().exec(function (e, count) {
            if (e) {
              console.log(e);
              return res.sendStatus(500);
            } else {
              res.render("user/history", {
                layout: "user/dashboard", full_name: req.session.full_name,
                email: req.session.email,
                userstatus: user.status,
                pagination: {
                  page: req.query.page || 1,
                  pageCount: Math.ceil(count / perTran),
                },
                transaction,
              });
            }
          });
        });
    }
  })
});
//Trang thông tin User
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
        profile: user, full_name: req.session.full_name, username: req.session.username,
        email: req.session.email, layout: "user/dashboard"
      })
    }
  })
})


router.get("/history/search", (req, res) => {
  sess = req.session;
  if (typeof sess.username == "undefined") { res.redirect("/"); }
  var from = req.query.from;
  console.log(from);
  var to = req.query.to;
  console.log(to);
  var type = req.query.type;
  console.log(type);
  User.findOne({ _id: mongoose.Types.ObjectId(req.session.userId) }, (e, user) => {
    const perUser = 10;
    const page = req.query.page;

    Transaction.find({ $or: [{ date: { $gte: from, $lt: to } }, { type: type }] })
      .sort({ date: -1 })
      .skip(perUser * page - perUser)
      .limit(perUser)
      .lean()
      .exec(function (e, transaction) {
        Transaction.countDocuments().exec(function (e, count) {
          if (e) {
            console.log(e);
            return res.sendStatus(500);
          } else {
            res.render("user/history", {
              full_name: req.session.full_name,
              email: req.session.email,
              layout: "user/dashboard",
              userstatus: user.status,
              pagination: {
                page: req.query.page || 1,
                pageCount: Math.ceil(count / perUser),
              },
              transaction,
            });
          }
        });
      });
  })
});

module.exports = router;
