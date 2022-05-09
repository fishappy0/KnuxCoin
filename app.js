const express =  require('express');
const app = express();
const hbars = require('express-handlebars');
const session = require('express-session');
const cookie = require('cookie-parser');
const multiparty = require('multiparty');
const body_parser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const port = 8080;
const mongoUrl = "mongodb://0.0.0.0:27017/test-db";

const testModel = require('./model/testdb_model.js');
mongoose.connect(mongoUrl).then(()=>{console.log(`<KnuxCoin Web> Connected to the database at ${mongoUrl}`)});
var parseBody = body_parser.urlencoded({extended: false});
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
app.post('/login', parseBody,(received, res) => {
    let req = received.body;
    let username = req.username;
    let password = req.password;
    console.log(`Password is ${password} and username is ${username}`);
    if(testModel.verifyAccount(username, password, `thisisakeylmao`)){
        res.redirect('/dashboard');
    };
})

//Trang đăng kí
app.get('/register', (req, res) => res.render('account/register'))
app.post('/register', parseBody, (req, res) =>{
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) =>{
        if(err) return res.status(500).send(err.message);
        let birthday = fields.birthday;
        let email = fields.address;
        let address = fields.mail;
        let full_name = fields.full_name;
    
        console.log(`full name: ${full_name}`)
        console.log(`mail: ${email}`)
        console.log(`address: ${address}`)
        console.log(`birthday: ${birthday}`)
    })
})

//Trang dashboard
app.get('/dashboard', (req, res) => res.render('user/dashboard', {layout: 'user'}))
app.post('/dashboard', (req, res) =>{

})

app.listen(port, ()=> console.log(
    `<KnuxCoin Web> Started on port ${port}` + `\n<KnuxCoin Web> Terminate with [Ctrl] + [C]`
))