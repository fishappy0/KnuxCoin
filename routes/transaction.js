// Nạp tiền, rút tiền, chuyển tiền,...
var express = require("express");
var router = express.Router();
var cardModel = require("../models/cards");
var transactionModel = require("../models/transaction");
var userModel = require("../models/users");
const bodyparser = require("body-parser");
const parseBody = bodyparser.urlencoded({ extended: false });

// Chuyển hướng đến history không vì lý do gì cả?
router.get("/", function(req, res) {
    res.redirect("user/history", {layout: "user/layout"});
});

router.get("/recharge", function(req, res) {
    res.render("admin/recharge", {layout: "layout"});

});

router.post("/recharge", parseBody, async function(req, res) {
    let body = req.body;
    let cardNumber = body.cardNumber;
    let expiryDate = body.expiryDate;
    let cvv = body.cvv;
    let amount = body.amount;
    let result = await cardModel.recharge(cardNumber, expiryDate, cvv, amount);
    res.render("admin/recharge", {layout: "layout", result: result});
});

module.exports = router;
