var express = require("express");
var router = express.Router();
const { dbg } = require("../local_utils");
<<<<<<< HEAD
=======
const alert = require("alert");
>>>>>>> dev

/* GET users listing. */
router.get("/", function (req, res, next) {
  sess = req.session;
  if (typeof sess.username != "undefined") {
    if (sess.first_time == true) {
<<<<<<< HEAD
      res.render("account/password", { error: "Please change your password before using the system!" })
    }
    else res.render("user/dashboard");
=======
      alert("Please change your password before using the system!");
      res.redirect("/password");
    } else
      res.render("user/dashboard", {
        full_name: req.session.full_name,
        email: req.session.email,
      });
>>>>>>> dev
  } else {
    res.redirect("/");
  }
});
router.post("/", (req, res, next) => { });

module.exports = router;
