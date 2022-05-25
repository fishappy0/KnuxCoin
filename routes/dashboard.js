var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  sess = req.session;
  if(typeof(sess.username) != "undefined"){
    res.render('user/dashboard')
  } else {
    res.redirect('/')
  }
});
router.post('/', (req, res, next) => {

})

module.exports = router;
