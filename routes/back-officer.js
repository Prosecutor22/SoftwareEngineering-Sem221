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
var Tasks = require('../models').Tasks;

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
router.get('/assign-task', ensureLoggedIn, async function(req, res, next) {
    if (Object.keys(req.query).length == 0) {
        docsRV = await Route.find({}, {_id: 0, path: 0});
        docsUnassigned = await Collector.find({}, {id: 1, _id: 0})
        res.send( docsUnassigned)
    }
    else {
        
    }
});

// TO-DO: render task history
router.get('/task-history', ensureLoggedIn, async function(req, res, next) {
    const coll = await Collector.find({});
    const jani = await Janitor.find({}); 
    var employee = coll.concat(jani)
    if (req.query.filter == undefined || req.query.value == ''){
        var docs = await Tasks.find({});
        docs.forEach(doc => doc.name = employee.find(element => element.id == doc.id).name);
        res.render('task-history', { title: 'Task History' , rows: docs})
    }
    else {
        filter = req.query.filter.toLowerCase()
        value = req.query.value
        if (filter == 'name') {
            filter = 'id'
            arID = employee.filter(element => element.name == value).map(element => element.id);
            value = {$in: arID}
        }
        var query = {};
        query[filter] = value;
        var docs = await Tasks.find(query);
        docs.forEach(doc => doc.name = employee.find(element => element.id == doc.id).name);
        res.render('task-history', { title: 'Task History' , rows: docs})
    }
});

module.exports = router;