var express = require('express');
var router = express.Router();
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var BackOfficer = require('../models').BackOfficer;
var MCP = require('../models').MCP;
var Collector = require('../models').Collector;
var Janitor = require('../models').Janitor;
var Vehicle = require('../models').Vehicle;
var Troller = require('../models').Troller;
var Route = require('../models').Route;
var Histories = require('../models').Histories;

var ensureLoggedIn = ensureLogIn('/signin');

function getNumber(modelCollection){
    return new Promise((resolve, reject) => {
        modelCollection.countDocuments({}, (err, count) => {
            if (err){
                reject(err);
            }
            else {
                resolve(count);
            }
        });
    });
}

// TO-DO: render dashboard
router.get('/dashboard', ensureLoggedIn, async function(req, res, next) {
    statistics = {};
    statistics = Object.assign(statistics, {"numBackOficer" : await getNumber(BackOfficer)});
    statistics = Object.assign(statistics, {"numMCP" : await getNumber(MCP)});
    statistics = Object.assign(statistics, {"numCollector" : await getNumber(Collector)});
    statistics = Object.assign(statistics, {"numJanitor" : await getNumber(Janitor)});
    statistics = Object.assign(statistics, {"numVehicle" : await getNumber(Vehicle)});
    statistics = Object.assign(statistics, {"numTroller" : await getNumber(Troller)});
    statistics = Object.assign(statistics, {"numRoute" : await getNumber(Route)});
    res.send(statistics);
});

// TO-DO: render assign task
router.get('/assign-task', ensureLoggedIn, function(req, res, next) {

});

// TO-DO: render task history
router.get('/task-history', ensureLoggedIn, function(req, res, next) {
    Histories.find({})
            .then(docs => res.render('task-history', { title: 'Task History' , rows: docs}))
});

router.post('/task-history', ensureLoggedIn, function(req, res, next) { 
    if (req.body.value == ""){
        Histories.find({})
                .then(docs => res.render('task-history', { title: 'Task History' , rows: docs}));
        return ;
    }
    filter = req.body.filter
    value = req.body.value
    var query = {};
    query[filter] = value;
    Histories.find(query)
                .then(docs => {
                    res.render('task-history', { title: 'Task History' , rows: docs});
                })
});

module.exports = router;