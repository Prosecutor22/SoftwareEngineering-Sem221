var express = require('express');
var router = express.Router();
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

var ensureLoggedIn = ensureLogIn('/signin');

// TO-DO: render dashboard
router.get('/dashboard', ensureLoggedIn, function(req, res, next) {
    res.send("Welcome to Dashboard!");
});

// TO-DO: render assign task
router.get('/assign-task', ensureLoggedIn, function(req, res, next) {

});

// TO-DO: render task history
router.get('/task-history', ensureLoggedIn, function(req, res, next) {

});

module.exports = router;