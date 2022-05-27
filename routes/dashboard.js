var express = require("express");
var router = express.Router();
const{dbg} = require("../local_utils");
const alert = require("alert");

/* GET users listing. */
router.get("/", function (req, res, next) {
  sess = req.session;
  if (typeof sess.username != "undefined") {
    if(sess.first_time == true){
      alert("Please change your password before using the system!");
      res.redirect("/password")
    }
    else res.render("user/dashboard");
  } else {
    res.redirect("/");
  }
});
router.post("/", (req, res, next) => {});

module.exports = router;
