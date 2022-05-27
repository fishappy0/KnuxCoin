var express = require("express");
var router = express.Router();
const { dbg } = require("../local_utils");

/* GET users listing. */
router.get("/", function (req, res, next) {
  sess = req.session;
  if (typeof sess.username != "undefined") {
    if (sess.first_time == true) {
      res.render("account/password", { error: "Please change your password before using the system!" })
    }
    else res.render("user/dashboard");
  } else {
    res.redirect("/");
  }
});
router.post("/", (req, res, next) => { });

module.exports = router;
