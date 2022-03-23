const express =  require('express');
const app = express();
const hbars = require('express-handlebars');
const session = require('express-session');
const cookie = require('cookie-parser')
const multiparty = require('multiparty')
const path = require('path');

const port = 8080;
app.engine('handlebars', hbars.engine({
    defaultLayout: '',
    helpers: {

    }
}))


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars')
app.use(express.static(__dirname+'/public'))

//Trang landing
app.get('/', (req, res) => res.render('index'))

//Trang đăng nhập
app.get('/login', (req, res) => res.render('account/login')) 
app.post('/login', (req, res) =>{

})

//Trang đăng kí
app.get('/register', (req, res) => res.render('account/register'))
app.post('/register', (req, res) =>{

})

//Trang dashboard
app.get('/dashboard', (req, res) => res.render('user/dashboard', {layout: 'user'}))
app.post('/dashboard', (req, res) =>{

})


app.listen(port, ()=> console.log(
    `<KnuxCoin Web> Started on port ${port}` + `\n<KnuxCoin Web> Terminate with [Ctrl] + [C]`
))