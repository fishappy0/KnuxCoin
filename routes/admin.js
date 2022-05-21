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
    })
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
    User.find({ status: "unapproved" }, (e, user) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500)
        }
        if (user) {
            res.render('admin/waiting', { waiting: user, layout: 'admin/layout' })
        }
    })
})
//xử lý xác minh tài khoản
router.post('/approve/:id', (req, res, next) => {
    User.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, (e, account) => {
        if (account && !e) {
            User.updateOne(
                { _id: mongoose.Types.ObjectId(req.params.id) },
                { $set: { status: 'Approved' } },
                function (err) {
                    if (err) {
                        console.log(e);
                        return res.sendStatus(500)
                    } else {
                        return res.redirect('/admin')
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
