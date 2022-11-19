var express = require('express');
var router = express.Router();

// TO-DO: render home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// TO-DO: render signin page
router.get('/signin', function(req, res, next) {

});

// TO-DO: handle signin with passport.js
router.post('/signin', function(req, res, next) {

});

// TO-DO: handle signout
router.post('/signout', function(req, res, next) {

});

module.exports = router;
