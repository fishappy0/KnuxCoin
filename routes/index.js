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
var parseBody = body_parser.urlencoded({ extended: false });

function saveRegisteredPicture(
  id_sidea_file,
  id_sidea_path,
  id_sideb_file,
  id_sideb_path,
  user_id_dir,
  user_id
) {
  let test_upload_dir = user_id_dir.split("/");
  let public_test_dir = './' + test_upload_dir[1] + '/' + test_upload_dir[2];
  if (!fs.existsSync(public_test_dir)) {
    fs.mkdirSync(public_test_dir);
  }
  if (!fs.existsSync(user_id_dir)) {
    fs.mkdirSync(user_id_dir);
  }

  fs.copyFile(id_sidea_path, user_id_dir + id_sidea_file, function (err) {
    if (err) throw err;
    console.log(
      `<KnuxCoin Account> User ${user_id} created account with id sideUpper file ${id_sidea_file}`
    );
  });
  fs.copyFile(id_sideb_path, user_id_dir + id_sideb_file, function (err) {
    if (err) throw err;
    console.log(
      `<KnuxCoin Account> User ${user_id} created account with id sideLower file ${id_sideb_file}`
    );
  });
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
  let error = undefined
 
  if (await accountModel.verifyAccount(req.session.username, old_pass) != null) {
    await accountModel.changePassword(username, new_pass);
    req.session.first_time = false;
    res.redirect('/dashboard');
  } else if (verify_new_pass != new_pass) {
    error = "The enetered password does not match"
  } else {
    error = "The old password does not match!"
  }
  if (error) {
    res.render("account/password", { error })
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
router.post("/login", parseBody, async (received, res, next) => {
  let req = received.body;
  let username = req.username;
  let password = req.password;

  queryResult = await accountModel.verifyAccount(username, password);
  if (queryResult != null) {
    sess = received.session;
    sess.username = username;
    sess.isAdmin = await queryResult["isAdmin"];
    sess.first_time = await queryResult["first_time_login"];
    if (typeof queryResult["isAdmin"] != "undefined" && sess.isAdmin == true) {
      res.redirect("/admin");
    } else {
      res.redirect("/dashboard");
    }
  } else {
    res.render("account/login", { error: 'Username or password is incorrect' })
  }
});

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
  await form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send(err.message);
    let birthday = fields.birthday.toString();
    let phone = fields.phone.toString();
    let email = await fields.mail.toString();
    let address = fields.address.toString();
    let full_name = fields.full_name.toString();

    // Month runs from 0 to 11. Full year %100 to get the last 2 digits;
    let current_time = new Date(Date.now());
    let account_id =
      current_time.getFullYear().toString().slice(2) +
      "U" +
      Math.round(Math.random() * 10000000).toString();
    let date = new Date(Date.now());
    let date_string =
      date.getDate() +
      "" +
      (date.getMonth() + 1) +
      "" +
      (date.getFullYear() % 100);
    let user_id = account_id;

    let id_sidea_path = files["id_photo_sidea"][0]["path"];
    let id_sideb_path = files["id_photo_sideb"][0]["path"];

    let id_sidea_file = "sideA" + "_" + date_string + "_" + user_id + ".png";
    let id_sideb_file = "sideB" + "_" + date_string + "_" + user_id + ".png";

    let user_id_dir = "./public/test_upload/" + user_id + "/";

    saveRegisteredPicture(
      id_sidea_file,
      id_sidea_path,
      id_sideb_file,
      id_sideb_path,
      user_id_dir,
      user_id
    );

    let obj_user_id = await userModel.createAccount(
      full_name,
      email,
      address,
      birthday,
      phone,
      user_id_dir + id_sidea_file,
      user_id_dir + id_sideb_file
    );
    let user_info_arr = await accountModel.createAccount(account_id, obj_user_id, phone);

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
    res.redirect("/login");
  });
});

module.exports = router;
