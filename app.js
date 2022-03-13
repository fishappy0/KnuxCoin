const express =  require('express');
const app = express();
const hbars = require('express-handlebars');
const multiparty = require('multiparty')

const port = 8080;

app.engine('handlebars', hbars.engine({
    defaultLayout: '',
    helpers: {

    }
}))

app.set('view engine', 'handlebars')

app.get('/', (req, res) => res.render('index'))

//Trang đăng nhập
app.get('/login', (req, res) => res.render('account/login')) 
app.post('/login', (req, res) =>{

})

//Trang đăng kí
app.get('/register', (req, res) => res.render('account/register'))
app.post('/register', (req, res) =>{

})


app.use(express.static(__dirname+'/public'))

app.listen(port, ()=> console.log(
    `<KnuxCoin Web> Started on port ${port}` + `\n<KnuxCoin Web> Terminate with [Ctrl] + [C]`
))