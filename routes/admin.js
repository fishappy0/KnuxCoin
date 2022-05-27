var express = require("express");
var router = express.Router();
const User = require('../models/testdb_model');
const Transaction = require('../models/transaction');
const Wallet = require('../models/wallet');
var mongoose = require('mongoose')
/* GET users listing. */
router.get("/", function (req, res, next) {
  if (typeof req.session.isAdmin == "undefined" || req.session.isAdmin == false)
    res.redirect("/");
  const perUser = 10;
  const page = req.query.page;

  User.find({})
    .sort({ createdAt: -1 })
    .skip(perUser * page - perUser)
    .limit(perUser)
    .lean()
    .exec(function (e, userList) {
      User.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        }
        res.render("admin/admin", {
          layout: "admin/layout",
          pagination: {
            page: req.query.page || 1,
            pageCount: Math.ceil(count / perUser),
          },
          userList,
        });
      });
    });
});

//Trang chi tiết account
router.get("/detail/:id", (req, res, next) => {
  User.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, (e, user) => {
    if (e) {
      console.log(e);
      return res.sendStatus(500);
    }
    if (user) {
      res.render("admin/accountdetail", {
        detail: user,
        layout: "admin/layout",
      });
    }
  });
});

//trang tài khoản chờ kích hoạt
router.get("/unapproved", (req, res, next) => {
  const perUser = 10;
  const page = req.query.page;

  User.find({ status: ["unapproved", "waiting"] })
    .sort({ createdAt: -1 })
    .skip(perUser * page - perUser)
    .limit(perUser)
    .lean()
    .exec(function (e, waiting) {
      User.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        }
        res.render("admin/waiting", {
          layout: "admin/layout",
          pagination: {
            page: req.query.page || 1,
            pageCount: Math.ceil(count / perUser),
          },
          waiting,
        });
      });
    });
});

//trang tài khoản đã kích hoạt
router.get("/approved", (req, res, next) => {
  const perUser = 10;
  const page = req.query.page;
  User.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .skip(perUser * page - perUser)
    .limit(perUser)
    .lean()
    .exec(function (e, active) {
      User.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        }
        res.render("admin/active", {
          layout: "admin/layout",
          pagination: {
            page: req.query.page || 1,
            pageCount: Math.ceil(count / perUser),
          },
          active,
        });
      });
    });
});

//trang tài khoản bị khóa
router.get("/locked", (req, res, next) => {
  const perUser = 10;
  const page = req.query.page;
  User.find({ status: "locked", abnormalLogin: 1 })
    .sort({ createdAt: -1 })
    .skip(perUser * page - perUser)
    .limit(perUser)
    .lean()
    .exec(function (e, lock) {
      User.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        }
        res.render("admin/locked", {
          layout: "admin/layout",
          pagination: {
            page: req.query.page || 1,
            pageCount: Math.ceil(count / perUser),
          },
          lock,
        });
      });
    });
});

//trang tài khoản bị vô hiệu hóa
router.get("/disabled", (req, res, next) => {
  const perUser = 10;
  const page = req.query.page;
  User.find({ status: "disabled" })
    .sort({ createdAt: -1 })
    .skip(perUser * page - perUser)
    .limit(perUser)
    .lean()
    .exec(function (e, disable) {
      User.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        }
        res.render("admin/disabled", {
          layout: "admin/layout",
          pagination: {
            page: req.query.page || 1,
            pageCount: Math.ceil(count / perUser),
          },
          disable,
        });
      });
    });
});

//xử lý xác minh tài khoản
router.post("/approve", (req, res, next) => {
  console.log(req.body.userid);
  User.findOne(
    { _id: mongoose.Types.ObjectId(req.body.userid) },
    (e, account) => {
      if (account && !e) {
        User.updateOne(
          { _id: mongoose.Types.ObjectId(req.body.userid) },
          { $set: { status: "approved" } },
          function (e) {
            if (e) {
              console.log(e);
              return res.sendStatus(500);
            } else {
              res.redirect("/");
            }
          }
        );
      } else {
        console.log(e);
        return res.sendStatus(500);
      }
    }
  );
});

//xử lý hủy tài khoản
router.post("/disable", (req, res, next) => {
  console.log(req.body.userid);
  User.findOne(
    { _id: mongoose.Types.ObjectId(req.body.userid) },
    (e, account) => {
      if (account && !e) {
        User.updateOne(
          { _id: mongoose.Types.ObjectId(req.body.userid) },
          { $set: { status: "disabled" } },
          function (e) {
            if (e) {
              console.log(e);
              return res.sendStatus(500);
            } else {
              res.redirect("/");
            }
          }
        );
      } else {
        console.log(e);
        return res.sendStatus(500);
      }
    }
  );
});

//Xử lý gửi yêu cầu bổ sung hồ sơ
router.post("/request", (req, res, next) => {
  console.log(req.body.userid);
  User.findOne(
    { _id: mongoose.Types.ObjectId(req.body.userid) },
    (e, account) => {
      if (account && !e) {
        User.updateOne(
          { _id: mongoose.Types.ObjectId(req.body.userid) },
          { $set: { status: "waiting" } },
          function (e) {
            if (e) {
              console.log(e);
              return res.sendStatus(500);
            } else {
              res.redirect("/");
            }
          }
        );
      } else {
        console.log(e);
        return res.sendStatus(500);
      }
    }
  );
});

//Xử lý mở khóa tài khoản
router.post("/unlock", (req, res, next) => {
  console.log(req.body.userid);
  console.log(req.body.lockedDate);
  User.findOne(
    { _id: mongoose.Types.ObjectId(req.body.userid) },
    (e, account) => {
      if (account && !e) {
        User.updateOne(
          { _id: mongoose.Types.ObjectId(req.body.userid) },
          {
            $set: {
              status: "approved",
              loginFail: 0,
              abnormalLogin: 0,
              lockedAt: "",
            },
          },
          function (e) {
            if (e) {
              console.log(e);
              return res.sendStatus(500);
            } else {
              res.redirect("/");
            }
          }
        );
      } else {
        console.log(e);
        return res.sendStatus(500);
      }
    }
  );
});

//trang lịch sử giao dịch
router.get("/history/:id", (req, res, next) => {
  console.log(req.params.id);
  //người chuyển
  const perUser = 10;
  const page = req.query.page;
  Transaction.find({
    $or: [
      {
        userId: { $elemMatch: { id: mongoose.Types.ObjectId(req.params.id) } },
      },
      {
        recipient: {
          $elemMatch: { id: mongoose.Types.ObjectId(req.params.id) },
        },
        status: "success",
      },
    ],
  })
    .sort({ dated: -1 })
    .skip(perUser * page - perUser)
    .limit(perUser)
    .lean()
    .exec(function (e, transaction) {
      Transaction.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        }
        res.render("admin/history", {
          layout: "admin/layout",
          pagination: {
            page: req.query.page || 1,
            pageCount: Math.ceil(count / perUser),
          },
          transaction,
        });
      });
    });
});

//trang chi tiết giao dịch
router.get("/transdetail/:id", (req, res, next) => {
  console.log(req.params.id);
  Transaction.findOne(
    { _id: mongoose.Types.ObjectId(req.params.id) },
    (e, trans) => {
      if (e) {
        console.log(e);
        return res.sendStatus(500);
      }
      if (trans) {
        console.log({ trans });
        res.render("admin/transactiondetail", {
          detail: trans,
          layout: "admin/layout",
        });
      }
    }
  );
});

//trang giao dịch rút tiền trên 5 triệu
router.get("/withdraw", (req, res, next) => {
  const perUser = 10;
  const page = req.query.page;
  Transaction.find({
    amount: { $gte: 5000000 },
    type: "withdraw",
    status: "pending",
  })
    .sort({ dated: -1 })
    .skip(perUser * page - perUser)
    .limit(perUser)
    .lean()
    .exec(function (e, pendlist) {
      Transaction.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        }
        res.render("admin/transpending", {
          layout: "admin/layout",
          pagination: {
            page: req.query.page || 1,
            pageCount: Math.ceil(count / perUser),
          },
          pendlist,
        });
      });
    });
});
//trang giao dịch chuyển tiền trên 5 triệu
router.get("/transfer", (req, res, next) => {
  const perUser = 10;
  const page = req.query.page;
  Transaction.find({
    amount: { $gte: 5000000 },
    type: "transfer",
    status: "pending",
  })
    .sort({ dated: -1 })
    .skip(perUser * page - perUser)
    .limit(perUser)
    .lean()
    .exec(function (e, pendlist) {
      Transaction.countDocuments().exec(function (e, count) {
        if (e) {
          console.log(e);
          return res.sendStatus(500);
        }
        res.render("admin/transpending", {
          layout: "admin/layout",
          pagination: {
            page: req.query.page || 1,
            pageCount: Math.ceil(count / perUser),
          },
          pendlist,
        });
      });
    });
});

//xử lý đồng ý giao dịch
router.post("/accept", (req, res, next) => {
  console.log(req.body.transid);
  Transaction.findOne(
    { _id: mongoose.Types.ObjectId(req.body.transid) },
    (e, trans) => {
      if (trans && !e) {
        Transaction.updateOne(
          { _id: mongoose.Types.ObjectId(req.body.transid) },
          { $set: { status: "success" } },
          function (e) {
            if (e) {
              console.log(e);
              return res.sendStatus(500);
            } else {
              res.redirect("/");
            }
          }
        );
      } else {
        console.log(e);
        return res.sendStatus(500);
      }
    }
  );
});

//xử lý từ chối giao dịch
router.post("/decline", (req, res, next) => {
  console.log(req.body.transid);
  Transaction.findOne(
    { _id: mongoose.Types.ObjectId(req.body.transid) },
    (e, trans) => {
      if (trans && !e) {
        Transaction.updateOne(
          { _id: mongoose.Types.ObjectId(req.body.transid) },
          { $set: { status: "fail" } },
          function (e) {
            if (e) {
              console.log(e);
              return res.sendStatus(500);
            } else {
              res.redirect("/");
            }
          }
        );
      } else {
        console.log(e);
        return res.sendStatus(500);
      }
    }
  );
});
module.exports = router;
