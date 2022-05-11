const express =  require('express');
const app = express();
const hbars = require('express-handlebars');
const session = require('express-session');
const cookie = require('cookie-parser');
const multiparty = require('multiparty');
const body_parser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const util = require('util');
const local_utils = require('./local_utils');
const crypto = require('crypto');

const port = 8080;
const mongoUrl = "mongodb://0.0.0.0:27017/test-db";

const testModel = require('./model/testdb_model.js');
const { connect } = require('http2');
var parseBody = body_parser.urlencoded({extended: false});

////   <----------> Custom functions of this file <--------->

mongoose.connect(mongoUrl).then(()=>{console.log(`<KnuxCoin Web> Connected to the database at ${mongoUrl}`)});
app.engine('handlebars', hbars.engine({
    defaultLayout: '',
    helpers: {
 
    }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars')
app.use(express.static(__dirname+'/public'))

//Trang landing
app.get('/', (req, res) => res.render('index'))

//Trang đăng nhập
app.get('/login', (req, res) => res.render('account/login')) 
app.post('/login', parseBody, async (received, res) => {
    let req = received.body;
    let username = req.username;
    let password = req.password;
    // console.log(`Password is ${password} and username is ${username}`);
    // testModel.createAccount("fosheppy1", "bouytenktritwoone", "thisisakeylmao");

    queryResult = await testModel.verifyAccount(username, password, `thisisakeylmao`)
    
    if(queryResult != null && queryResult['username'] != null){
        res.redirect('/dashboard');
    } else{
        res.redirect('/login');
    };
})

//Trang đăng kí
app.get('/register', (req, res) => res.render('account/register'))
app.post('/register', (req, res) =>{
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) =>{
        if(err) return res.status(500).send(err.message);
        let birthday = fields.birthday;
        let email = fields.address;
        let address = fields.mail;
        let full_name = fields.full_name;
 
        // Month runs from 0 to 11. Full year %100 to get the last 2 digits;
        let date = new Date(Date.now())
        let date_string = date.getDate() +""+ (date.getMonth()+1) +""+(date.getFullYear()%100);
        let user_id = crypto.randomBytes(4).toString('hex');
        
        let id_sidea_path = files['id_photo_sidea'][0]['path']; 
        let id_sideb_path = files['id_photo_sideb'][0]['path'];
        
        let id_sidea_file =  'sideA' + '_' + date_string + '_' + user_id;
        let id_sideb_file =  'sideB' + '_' + date_string + '_' + user_id;
 
        let user_id_dir =  './test_upload/' +user_id+'/';
 
        if(!fs.existsSync(user_id_dir)) {
            fs.mkdirSync(user_id_dir);
        }
    
        fs.rename(id_sidea_path, user_id_dir + id_sidea_file,function (err) {
            if(err) throw err;
            console.log(`<KnuxCoin Account> User ${user_id} created account with id sideUpper file ${id_sidea_file}`);
        });
        fs.rename(id_sideb_path, user_id_dir + id_sideb_file,function (err) {
            if(err) throw err;
            console.log(`<KnuxCoin Account> User ${user_id} created account with id sideLower file ${id_sideb_file}`);
        });



        let login_username = Math.round(Math.random() * 10000000000);
        let login_password = crypto.randomBytes(5).toString('hex');
        testModel.createAccount(login_username, login_password, user_id);
        res.redirect('/login');
    })
})

//Trang dashboard
app.get('/dashboard', (req, res) => res.render('user/dashboard', {layout: 'user'}))
app.post('/dashboard', (req, res) =>{

})

app.listen(port, ()=> console.log(
    `<KnuxCoin Web> Started on port ${port}` + `\n<KnuxCoin Web> Terminate with [Ctrl] + [C]`
))
