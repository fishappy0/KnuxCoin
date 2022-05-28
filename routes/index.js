var express = require("express");
var router = express.Router();

const accountModel = require("../models/account");
const testModel = require("../models/testdb_model");
const userModel = require("../models/users");

const fs = require("fs");
const crypto = require("crypto");
const session = require("express-session");
const multiparty = require("multiparty");
const xoauth2 = require("xoauth2");
const node_mailer = require("nodemailer");
const body_parser = require("body-parser");
const { connect } = require("http2");
const { dbg } = require("../local_utils");
const alert = require("alert");
const SMTPTransport = require("nodemailer/lib/smtp-transport");
const User = require("../models/users");
var parseBody = body_parser.urlencoded({ extended: false });

async function sendAccountInfoToMail(email) {
  let message = {
    from: "sinhvien@phongdaotao.com",
    to: email,
    subject: "KnuxCoin Service",
    text: `Greeting ${full_name}, \nThank you for registering with KnuxCoin, the credentials to access the service is as follows:\nUsername:${user_info_arr[1]}\nPassword:${user_info_arr[2]}`,
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
  } catch (err) {
    alert(
      `There was a problem emailing, This is your created account \nUsername: ${user_info_arr[0]} \nPassword: ${user_info_arr[1]}`
    );
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
  let username = req.session.username.toString();
  let old_pass = body.old_password.toString();
  let new_pass = body.new_password.toString();
  let verify_new_pass = body.verify_new_password.toString();

  if (verify_new_pass != new_pass) {
    alert("The enetered password does not match");
    return;
  }

  if (new_pass.length < 6) {
    alert("The password length is larger than 6!");
    return;
  }

  if (
    (await accountModel.verifyAccount(req.session.username, old_pass)) != null
  ) {
    await accountModel.changePassword(username, new_pass);
    req.session.first_time = false;
    alert("Password changed succesfully");
    res.redirect("/dashboard");
  } else {
    alert("The old password does not match!");
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

  if (login_attempts == 3) {
    alert("Out of login attempts");
    res.redirect("/login");
  } else {
    // Checks if the username exists
    if ((await accountModel.getUserByUsername(username)) == null) {
      alert("Username or password is incorrect!");
      return res.redirect("/login");
    }

    // Tries to login with the username
    queryResult = await accountModel.verifyAccount(username, password);
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
      }

      if (
        typeof queryResult["isAdmin"] != "undefined" ||
        sess.isAdmin == true
      ) {
        return res.redirect("/admin");
      } else {
        // Reset the failed login attempt count after a succesful login
        await userModel.resetLoginAttempts(username);
        return res.redirect("/dashboard");
      }
    }

    // Login failed
    if (login_attempts < 4 && username != "admin") {
      await userModel.addLoginFailAttempts(username);
      login_attempts += 1;
      alert(
        `Password is incorrect, you used ${login_attempts} out of 3 allowed login attempts before the account is locked!`
      );

      if (login_attempts == 3) {
        await User.addAbnormalLogin(username);
      }

      return res.redirect("/login");
    } else {
      alert("Username or password is incorrect!");
      return res.redirect("/login");
    }
  }
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

    //Create an account in the database
    if (obj_user_id == null) return;
    let user_info_arr = await accountModel.createAccount(
      account_id,
      phone,
      obj_user_id
    );
    if (user_info_arr == null) return;

    //Send the account created to the user
    sendAccountInfoToMail(email);
    res.redirect("/login");
  });
});

module.exports = router;
