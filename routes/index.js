var express = require('express');
var router = express.Router();

const accountModel = require('../models/account');
const testModel = require('../models/testdb_model');
const userModel = require('../models/users');

const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const multiparty = require('multiparty');
const xoauth2 = require('xoauth2');
const node_mailer = require('nodemailer');
const body_parser = require('body-parser');
const { connect } = require('http2');
const { dbg } = require('../local_utils');
const alert = require('alert');
const SMTPTransport = require('nodemailer/lib/smtp-transport');
var parseBody = body_parser.urlencoded({ extended: false });

function saveRegisteredPicture(id_sidea_file,
                               id_sidea_path,
                               id_sideb_file,
                               id_sideb_path,
                               user_id_dir,
                               user_id){
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
}

//Trang landing
router.get('/', function (req, res, next) {
  res.render('index');
});


//Trang đăng nhập
router.get('/login', (req, res, next) => {
  if(typeof(req.session.username) == "undefined"){ 
    res.render('account/login')
  } else {
    res.redirect('/dashboard')
  }
})
router.post('/login', parseBody, async (received, res, next) => {
  let req = received.body;
  let username = req.username;
  let password = req.password;

  // console.log(`Password is ${password} and username is ${username}`);
  // let account_info = await accountModel.createAccount();
  // dbg(account_info)

  queryResult = await accountModel.verifyAccount(username, password)

  if (queryResult != null) {
    sess = received.session;
    sess.username = username;
    sess.isAdmin = queryResult['isAdmin']; 
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  };
})

router.post('/logout', parseBody, async(received, res, next) =>{
  received.session.destroy();
  res.redirect('/')
})


//Trang đăng kí
router.get('/register', (req, res, next) => {
  if(typeof(req.session.username) == "undefined") res.render('account/register');
  else res.redirect('/dashboard');
});
router.post('/register', async (req, res, next) => {
  const form = new multiparty.Form();
  await form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send(err.message);
    let birthday = fields.birthday.toString();
    let phone = fields.phone.toString();
    let email = await fields.address.toString();
    let address = fields.mail.toString();
    let full_name = fields.full_name.toString();

    // Month runs from 0 to 11. Full year %100 to get the last 2 digits;
    let date = new Date(Date.now())
    let date_string = date.getDate() + "" + (date.getMonth() + 1) + "" + (date.getFullYear() % 100);
    await userModel.createAccount(full_name, email, address, birthday, phone);
    let user_info_arr = await accountModel.createAccount(phone);
    let user_id = user_info_arr[0];

    let id_sidea_path = files['id_photo_sidea'][0]['path'];
    let id_sideb_path = files['id_photo_sideb'][0]['path'];

    let id_sidea_file = 'sideA' + '_' + date_string + '_' + user_id;
    let id_sideb_file = 'sideB' + '_' + date_string + '_' + user_id;

    let user_id_dir = './test_upload/' + user_id + '/';

    saveRegisteredPicture(id_sidea_file, id_sidea_path, id_sideb_file, id_sideb_path, user_id_dir, user_id);

    let message = {
      from: 'sinhvien@phongdaotao.com',
      to: email,
      subject: "KnuxCoin Service",
      text: `Greeting ${full_name}, \nThank you for registering with KnuxCoin, the credentials to access the service is as follows:\nUsername:${user_info_arr[1]}\nPassword:${user_info_arr[2]}`
    }
    try {  
      smtp_transport = node_mailer.createTransport({
        host: "mail.phongdaotao.com",
        port:25,
        secure: false,
        auth: {
            user: "sinhvien@phongdaotao.com", 
            pass: "svtdtu"
        },
        tls:{
          rejectUnauthorized:false
        }
      })
      await smtp_transport.sendMail(message)
    } catch(err){
      alert(`There was a problem emailing, This is your created account \nUsername: ${user_info_arr[1]} \nPassword: ${user_info_arr[2]}`);
    }
      res.redirect('/login');
  })
})

module.exports = router;
