var express = require('express');
var router = express.Router();
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var MCP = require('../models').MCP;
var Collector = require('../models').Collector;
var Janitor = require('../models').Janitor;
var Route = require('../models').Route;
var Tasks = require('../models').Tasks;

var ensureLoggedIn = ensureLogIn('/signin');
router.use(ensureLoggedIn);

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

router.get('/dashboard', async function(req, res, next) {
    statistics = {};
    statistics = Object.assign(statistics, {"numMCP" : await getNumber(MCP)});
    statistics = Object.assign(statistics, {"numCollector" : await getNumber(Collector)});
    statistics = Object.assign(statistics, {"numJanitor" : await getNumber(Janitor)});
    statistics = Object.assign(statistics, {"numVehicle" : await getNumber(Route)});
    statistics = Object.assign(statistics, {"numTroller" : await getNumber(Janitor)});
    statistics = Object.assign(statistics, {"numRoute" : await getNumber(Route)});
    res.send(statistics);
});

// TO-DO: render assign task
// query: week, type
router.get('/assign-task', async function(req, res, next) {
    var cur = req.query.week;
    var retAssign = {};
    retAssign.week = cur;
    var docsfileter = {};
    docsfileter.week = cur;
    if (req.query.type == "collector") {
        docsUnassigned = await Collector.find({}, {id: 1, _id: 0});
        schedule = await Tasks.find({week: cur, id:/^C[1-4]/}, {id: 1, route:1, vehicle:1, _id: 0});
        docsAssigned = await Tasks.find({week:cur, id:/^C[1-4]/}, {id: 1, _id: 0});
        var assign = [];
        docsUnassigned.forEach(element => {
            if (docsAssigned.find(e => e.id === element.id) === undefined) assign.push(element.id);
        });
        retAssign.Unassignee = assign;
        retAssign.Schedule = schedule;
        docsfileter.type = 'Collector';
    }
    else {
        docsUnassigned = await Janitor.find({}, {id: 1, _id: 0});
        schedule = await Tasks.find({week: cur, id:/^J[0-9]{1,2}/}, {id: 1, mcp:1, troller:1, _id: 0});
        docsAssigned = await Tasks.find({week:cur, id:/^J[0-9]{1,2}/}, {id: 1, _id: 0});
        var assign = [];
        docsUnassigned.forEach(element => {
            if (docsAssigned.find(e => e.id === element.id) === undefined) assign.push(element.id);
        });
        retAssign.Unassignee = assign;
        retAssign.Schedule = schedule;
        docsfileter.type = 'Janitor';
    }
    docsfileter.lastModified = await Tasks.find({week:cur}, {lastModified:1, _id: 0});
    retAssign.filter = docsfileter;
    res.send(retAssign);
});

// TO-DO: save tasks in mongoDB
// body: data (similar to data in assign-task.ejs)
// send: result and last modified
router.post('/assign-task');

// TO-DO: find and return task data of given week's previous week
// query: week
// send: data (similar to data in assign-task.ejs)
router.get('/assign-task/last-week');

// TO-DO: create records of new week in tasks collection
// send: new week created
router.get('/assign-task/new-week');

// TO-DO: render task history
// query: filters: [{field: ..., value:...}]
router.get('/task-history', async function(req, res, next) {
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