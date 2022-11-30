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
    res.render('assign-task', {
        title: 'Assign Task',
        task: [{'route': "ABC", 'vehicle': "12345", 'assignee': "collector 5"},
               {'route': "ABCD", 'vehicle': "123456", 'assignee': "collector 6"}]
    })
});

// TO-DO: render task history
router.get('/task-history', ensureLoggedIn, function(req, res, next) {
    res.render('task-history', {
        title: 'Task History',
        history: [{'week': 1, 'janitor': '001'},
                  {'week': 2, 'janitor': '002'}]
    })
});

module.exports = router;