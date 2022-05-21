var express = require('express');
var router = express.Router();
const User = require('../models/testdb_model');
var mongoose = require('mongoose')
/* GET users listing. */
router.get('/', function (req, res, next) {
    User.find((e, users) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500)
        }
        res.render('admin/admin', { userList: users, layout: 'admin/layout' })
    }).sort({createdAt: -1})
});
//Trang chi tiết account
router.get('/detail/:id', (req, res) => {
    User.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, (e, user) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500)
        }
        if (user) {
            res.render('admin/accountdetail', { detail: user, layout: 'admin/layout' })
        }
    })
})
//trang tài khoản chờ kích hoạt
router.get('/unapproved', (req, res, next) => {
    User.find({ status: ["unapproved", "waiting"] }, (e, user) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500)
        }
        if (user) {
            res.render('admin/waiting', { waiting: user, layout: 'admin/layout' })
        }
    }).sort({createdAt: -1})
})

//trang tài khoản đã kích hoạt
router.get('/approved', (req, res, next) => {
    User.find({ status: "approved" }, (e, user) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500)
        }
        if (user) {
            res.render('admin/active', { active: user, layout: 'admin/layout' })
        }
    }).sort({createdAt: -1})
})

//trang tài khoản bị khóa
router.get('/locked', (req, res, next) => {
    User.find({ status: "locked", abnormalLogin: 1 }, (e, user) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500)
        }
        if (user) {
            res.render('admin/locked', { lock: user, layout: 'admin/layout' })
        }
    }).sort({lockedAt: -1})
})

//trang tài khoản bị vô hiệu hóa
router.get('/disabled', (req, res, next) => {
    User.find({ status: "disabled" }, (e, user) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500)
        }
        if (user) {
            res.render('admin/disabled', { disable: user, layout: 'admin/layout' })
        }
    }).sort({createdAt: -1})
})

//xử lý xác minh tài khoản
router.post('/approve', (req, res, next) => {
    console.log(req.body.userid)
    User.findOne({ _id: mongoose.Types.ObjectId(req.body.userid) }, (e, account) => {
        if (account && !e) {
            User.updateOne(
                { _id: mongoose.Types.ObjectId(req.body.userid) },
                { $set: { status: 'approved' } },
                function (err) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500)
                    } else {
                        res.redirect('/')
                    }
                }
            )
        } else {
            console.log(e);
            return res.sendStatus(500)
        }
    })
})

//xử lý hủy tài khoản
router.post('/decline', (req, res, next) => {
    console.log(req.body.userid)
    User.findOne({ _id: mongoose.Types.ObjectId(req.body.userid) }, (e, account) => {
        if (account && !e) {
            User.updateOne(
                { _id: mongoose.Types.ObjectId(req.body.userid) },
                { $set: { status: 'disabled' } },
                function (err) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500)
                    } else {
                        res.redirect('/')
                    }
                }
            )
        } else {
            console.log(e);
            return res.sendStatus(500)
        }
    })
})

//Xử lý gửi yêu cầu bổ sung hồ sơ
router.post('/request', (req, res, next) => {
    console.log(req.body.userid)
    User.findOne({ _id: mongoose.Types.ObjectId(req.body.userid) }, (e, account) => {
        if (account && !e) {
            User.updateOne(
                { _id: mongoose.Types.ObjectId(req.body.userid) },
                { $set: { status: 'waiting' } },
                function (err) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500)
                    } else {
                        res.redirect('/')
                    }
                }
            )
        } else {
            console.log(e);
            return res.sendStatus(500)
        }
    })
})

//Xử lý mở khóa tài khoản
router.post('/unlock', (req, res, next) => {
    console.log(req.body.userid)
    console.log(req.body.lockedDate)
    User.findOne({ _id: mongoose.Types.ObjectId(req.body.userid) }, (e, account) => {
        if (account && !e) {
            User.updateOne(
                { _id: mongoose.Types.ObjectId(req.body.userid) },
                { $set: { status: 'approved', loginFail: 0, abnormalLogin: 0, lockedAt: "" } },
                function (err) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(500)
                    } else {
                        res.redirect('/')
                    }
                }
            )
        } else {
            console.log(e);
            return res.sendStatus(500)
        }
    })
})
module.exports = router;
