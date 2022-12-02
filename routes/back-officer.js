var express = require('express');
const { restart } = require('nodemon');
const datelib = require('date-and-time')
var router = express.Router();
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var MCP = require('../models').MCP;
var Collector = require('../models').Collector;
var Janitor = require('../models').Janitor;
var Route = require('../models').Route;
var Tasks = require('../models').Tasks;
var weekTime = require('../models').weekTime;

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
    var lastMod = await Tasks.find({week:cur}, {lastModified:1, startDay:1, _id: 0});
    docsfileter.lastModified = lastMod.lastModified;
    docsfileter.startDay = lastMod.startDay;
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
router.get('/assign-task/last-week', async function(req, res, next){
    var cur = req.query.week - 1;
    var employee = req.query.employee;
    var retAssign = {};
    var data = {};
    var docsfilter = {};
    var stt = Tasks.find({week: cur})[0].status;
    if (cur < 1 || stt != "done"){
        res.status(404);
    }
    retAssign.week = cur;
    if (employee === "collector"){
        data.unassigned =[];
        data.schedule = await Tasks.find({week: cur, id:/^C[1-4]/}, {id: 1, route:1, vehicle:1, _id: 0});
    }
    else {
        data.unassigned =[];
        data.docsAssigned = await Tasks.find({week:cur, id:/^J[0-9]{1,2}/}, {id: 1, _id: 0});
    }
    retAssign.data = data;
    docsfilter.week = cur;
    docsfilter.type = employee;
    retAssign.filter = docsfilter;
    res.send(retAssign);
});

// TO-DO: create records of new week in tasks collection
// send: new week created
router.get('/assign-task/new-week', async function(req, res, next){
    const weeklist = await weekTime.find({}).sort({week: -1});
    const latestWeek = weeklist[0].week + 1;
    var startWeek = datelib.addDays(weeklist[0].startDay, 7);
    var currentDate = new Date();
    var newWeek = new weekTime({week: latestWeek, status: "in-progress", lastModified: currentDate, startDay: startWeek});
    newWeek.save(function(err){
        if (err) {
            res.status(400).send("Cannot create new week");
        }
    });
    for (let i = 1; i < 23; ++i) {
        var jani = new Tasks({week: latestWeek, id: "J" + i.toString()});
        jani.save(function(err){
            if (err) {
                res.status(400).send("Cannot create new week");
            }
        });
    }
    for (let i = 1; i < 5; ++i) {
        var collec = new Tasks({week: latestWeek, id: "C" + i.toString()});
        collec.save(function(err){
            if (err) {
                res.status(400).send("Cannot create new week");
            }
        });
    }
    res.send("create new week successfully");
});

// TO-DO: render task history
// query: filters: [{field: ..., value:...}]
router.get('/task-history', ensureLoggedIn, async function(req, res, next) {
    const coll = await Collector.find({});
    const jani = await Janitor.find({}); 
    var employee = coll.concat(jani)
    if (req.query.filters === undefined || req.query.filters === '[]'){
        var rows = await Tasks.find({});
        rows.forEach(row => row.name = employee.find(element => element.id == row.id).name);
        res.render('task-history', { title: 'Task History' , rows: docs, filters: []})
    }
    else {
        var query = {};
        var filterArr = req.query.filters.substring(1,req.query.filters.length-1).replaceAll('},{', '};{').split(';');
        var filters = [];
        for (let i = 0; i < filterArr.length; ++i){
            var tmp = filterArr[i].split(/[,:{}]/).filter(e => e != ''); // ['field', 'Week', 'value', '1']
            if (tmp[3] == '') continue;
            if (tmp[1].toLowerCase() == 'name') {
                var filter = 'id';
                var arID = employee.filter(element => element.name == value).map(element => element.id);
                var value = {$in: arID};
                query[filter] = value;
            }
            else {
                query[tmp[1].toLowerCase()] = tmp[3];
            }
            filters.push({field:tmp[1],value:tmp[3]})
        }
        var docs = await Tasks.find(query);
        docs.forEach(doc => doc.name = employee.find(element => element.id == doc.id).name);
        res.render('task-history', { title: 'Task History' , rows: docs, filters: filters})
    }
});

module.exports = router;
