var express = require('express');
var router = express.Router();
const fs = require('fs');
const crypto = require('crypto');
const testModel = require('../models/testdb_model');
const { connect } = require('http2');
const body_parser = require('body-parser');
var parseBody = body_parser.urlencoded({ extended: false });

//Trang landing
router.get('/', function (req, res, next) {
  res.render('index');
});
//Trang đăng nhập
router.get('/login', (req, res, next) => res.render('account/login'))
router.post('/login', parseBody, async (received, res, next) => {
  let req = received.body;
  let username = req.username;
  let password = req.password;
  // console.log(`Password is ${password} and username is ${username}`);
  // testModel.createAccount("fosheppy1", "bouytenktritwoone", "thisisakeylmao");

  queryResult = await testModel.verifyAccount(username, password, `thisisakeylmao`)

  if (queryResult != null && queryResult['username'] != null) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  };
})

//Trang đăng kí
router.get('/register', (req, res, next) => res.render('account/register'))
router.post('/register', (req, res, next) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).send(err.message);
    let birthday = fields.birthday;
    let email = fields.address;
    let address = fields.mail;
    let full_name = fields.full_name;

    // Month runs from 0 to 11. Full year %100 to get the last 2 digits;
    let date = new Date(Date.now())
    let date_string = date.getDate() + "" + (date.getMonth() + 1) + "" + (date.getFullYear() % 100);
    let user_id = crypto.randomBytes(4).toString('hex');

    let id_sidea_path = files['id_photo_sidea'][0]['path'];
    let id_sideb_path = files['id_photo_sideb'][0]['path'];

    let id_sidea_file = 'sideA' + '_' + date_string + '_' + user_id;
    let id_sideb_file = 'sideB' + '_' + date_string + '_' + user_id;

    let user_id_dir = './test_upload/' + user_id + '/';

    if (!fs.existsSync(user_id_dir)) {
      fs.mkdirSync(user_id_dir);
    }

    fs.rename(id_sidea_path, user_id_dir + id_sidea_file, function (err) {
      if (err) throw err;
      console.log(`<KnuxCoin Account> User ${user_id} created account with id sideUpper file ${id_sidea_file}`);
    });
    fs.rename(id_sideb_path, user_id_dir + id_sideb_file, function (err) {
      if (err) throw err;
      console.log(`<KnuxCoin Account> User ${user_id} created account with id sideLower file ${id_sideb_file}`);
    });



    let login_username = Math.round(Math.random() * 10000000000);
    let login_password = crypto.randomBytes(5).toString('hex');
    testModel.createAccount(login_username, login_password, user_id);
    res.redirect('/login');
  })
})
//Trang dashboard
router.get('/dashboard', (req, res, next) => res.render('user/dashboard'))
router.post('/dashboard', (req, res, next) => {

})
module.exports = router;
