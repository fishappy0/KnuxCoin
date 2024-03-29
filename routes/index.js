var express = require("express");
var router = express.Router();

const accountModel = require("../models/account");
const userModel = require("../models/users");

const fs = require("fs");
const crypto = require("crypto");
const session = require("express-session");
const multiparty = require("multiparty");
const xoauth2 = require("xoauth2");
const node_mailer = require("nodemailer");
const body_parser = require("body-parser");
const { connect } = require("http2");
const alert = require("alert");
const SMTPTransport = require("nodemailer/lib/smtp-transport");
const User = require("../models/users");
var parseBody = body_parser.urlencoded({ extended: false });

async function sendAccountInfoToMail(email, email_message) {
  let message = {
    from: "sinhvien@phongdaotao.com",
    to: email,
    subject: "KnuxCoin Service",
    text: email_message,
  };
  try {
    smtp_transport = node_mailer.createTransport({
      host: "mail.phongdaotao.com",
      port: 25,
      secure: false,
      auth: {
        user: "sinhvien@phongdaotao.com",
        pass: "svtdtu",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await smtp_transport.sendMail(message);
    return "success";
  } catch (err) {
    return err;
  }
}

//Trang landing
router.get("/", function (req, res, next) {
  res.render("index");
});

// Trang đổi mk
router.get("/password", function (req, res, next) {
  if (typeof req.session.username == "undefined") res.redirect("/");
  else res.render("account/password");
});
router.post("/password", parseBody, async function (req, res, next) {
  let body = req.body;
  let username = req.session.username;
  if (typeof username == "undefined") { return res.redirect("/"); }
  else { username = username.toString(); }
  let old_pass = body.old_password.toString();
  let new_pass = body.new_password.toString();
  let verify_new_pass = body.verify_new_password.toString();
  let error = null;

  // Initial check before accessing the database
  if (verify_new_pass != new_pass) {
    error = "The enetered password does not match with the verify password";
  }
  if (new_pass.length > 6) {
    error = "The password length is larger than 6!";
  }
  if (error) {
    return res.render("account/password", { error });
  }

  // checks after accessing the database
  if (
    (await accountModel.verifyPassword(req.session.username, old_pass)) != null
  ) {
    await accountModel.changePassword(username, new_pass);
    req.session.first_time = false;
    return res.redirect("/dashboard");
  } else {
    return res.render("account/password", { error: "The old password does not match!" });
  }

});

//Trang đăng nhập
router.get("/login", (req, res, next) => {
  if (typeof req.session.username == "undefined") {
    res.render("account/login");
  } else {
    res.redirect("/dashboard");
  }
});
router.post("/login", parseBody, async (req, res, next) => {
  let body = req.body;
  let sess = req.session;
  let username = body.username;
  let password = body.password;

  let login_attempts = 0;
  let failedAttempts = await userModel.getLoginFailAttempts(username);
  if (failedAttempts != null) {
    login_attempts = failedAttempts;
  }

  let accountStatus = await userModel.getUserStatus(username);
  if (failedAttempts == 3 || accountStatus == 'locked') {
    res.render("account/login", { error: "The account has been locked due to incorrect password input many times.\nPlease contact the administrator for assistance." });
  } else if (accountStatus == 'disabled') {
    res.render("account/login", { error: "This account has been disabled.\nPlease contact 18001008" });
  }
  else {
    // Checks if the username exists
    if ((await accountModel.getUserByUsername(username)) == null) {
      return res.render("account/login", {
        error: "Username or password is incorrect!",
      });
    }

    // Tries to login with the username
    queryResult = await accountModel.verifyPassword(username, password);
    if (queryResult != null) {
      let userid = await queryResult["user_id"];
      let userModelResult = await userModel.findById(await userid);
      sess.loginFailAttemps = 0;
      sess.username = username;
      sess.isAdmin = await queryResult["isAdmin"];
      if (sess.isAdmin == false) {
        sess.first_time = await queryResult["first_time_login"];
        sess.full_name = await userModelResult["full_name"].toString();
        sess.email = await userModelResult["email"].toString();
        sess.userId = await userModelResult["_id"].toString();
        sess.userstatus = await userModelResult["status"].toString();
      }

      if (
        typeof queryResult["isAdmin"] != "undefined" &&
        sess.isAdmin == true
      ) {
        return res.redirect("/admin");
      }
      // Reset the failed login attempt count after a succesful login
      await userModel.resetLoginAttempts(username);
      return res.redirect("/dashboard");
    }

    // Login failed
    if (login_attempts < 4 && username != "admin") {
      await userModel.addLoginFailAttempts(username);
      login_attempts += 1;
      if (login_attempts == 3) {
        await userModel.addAbnormalLoginAndLockAccount(username);
      }
      return res.render("account/login", {
        error: `Password is incorrect, you used ${login_attempts} out of 3 allowed login attempts before the account is locked!`,
      });
    } else {
      return res.render("account/login", {
        error: `Username or password is incorrect!`
      });
    }
  }
});
//Cập nhật cmnd
router.get("/update_id", (req, res, next) => {
  sess = req.session;
  if (typeof sess.username == "undefined") { res.redirect("/"); }
  res.render("account/update_id");
});
router.post("/update_id", parseBody, async function (req, res, next) {
  sess = req.session;
  if (typeof sess.username == "undefined") { res.redirect("/"); }
  let form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    let userData = await accountModel.findOne({ username: sess.username });
    if (typeof userData == "undefined") {
      return res.render("account/update_id", { error: "Unknown internal server error" });
    }

    let account_id = userData["account_id"];
    let id_sidea_path = files["id_photo_sidea"][0]["path"];
    let id_sideb_path = files["id_photo_sideb"][0]["path"];

    let id_sidea_file = "sideA" + "_" + account_id + ".png";
    let id_sideb_file = "sideB" + "_" + account_id + ".png";

    let user_id_dir = "./public/test_upload/" + account_id + "/";
    if (!fs.existsSync(user_id_dir)) {
      return res.render("account/update_id", { error: "Internal server error: photo does not exist" });
    }

    fs.copyFile(id_sidea_path, user_id_dir + id_sidea_file, function (err) {
      if (err) throw err;
      console.log(
        `<KnuxCoin Account> User ${account_id} replaced the old upper side ID with file ${id_sidea_file}`
      );
    });
    fs.copyFile(id_sideb_path, user_id_dir + id_sideb_file, function (err) {
      if (err) throw err;
      console.log(
        `<KnuxCoin Account> User ${account_id} replaced the old upper side ID with file ${id_sideb_file}`
      );
      return res.redirect('/dashboard');
    });

  });
});
//Logout
router.post("/logout", parseBody, async (received, res, next) => {
  received.session.destroy();
  res.redirect("/");
});

//Trang đăng kí
router.get("/register", (req, res, next) => {
  if (typeof req.session.username == "undefined")
    res.render("account/register");
  else res.redirect("/dashboard");
});
router.post("/register", async (req, res, next) => {
  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send(err.message);
    let birthday = fields.birthday.toString();
    let phone = fields.phone.toString();
    let email = fields.email.toString();
    let address = fields.address.toString();
    let full_name = fields.full_name.toString();

    //Generate files and account_id
    let date = new Date(Date.now());
    let account_id =
      date.getFullYear().toString().slice(2) +
      "U" +
      Math.round(Math.random() * 10000000).toString();

    //Create a user in the database and save the profile picture
    let obj_user_id = await userModel.createUser(
      full_name,
      email,
      address,
      birthday,
      phone,
      account_id,
      files
    );
    let error = undefined
    if (error) {
      res.render('account/login', { error: error })
    }
    //Create an account in the database
    if (obj_user_id == null) return;
    let user_info_arr = await accountModel.createAccount(
      account_id,
      phone,
      obj_user_id
    );
    if (user_info_arr == null) return;

    let email_message = `Greeting ${full_name}, \nThank you for registering with KnuxCoin, the credentials to access the service is as follows:\nUsername:${user_info_arr[0]}\nPassword:${user_info_arr[1]}`;
    let alert_message = `Account created successfully, however there was a problem with the mail service. Therefore, we deliver this message with your login credential as follows: \nUsername: ${user_info_arr[0]} \nPassword: ${user_info_arr[1]}`;
    //Send the account created to the user
    if (sendAccountInfoToMail(email, email_message) != "success") {
      res.render('account/login', { success: alert_message })
    }

  });
});

module.exports = router;
