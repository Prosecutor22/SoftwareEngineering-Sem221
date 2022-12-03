var express = require('express');
const datelib = require('date-and-time')
var router = express.Router();
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var MCP = require('../models').MCP;
var Collector = require('../models').Collector;
var Janitor = require('../models').Janitor;
var Route = require('../models').Route;
var Tasks = require('../models').Tasks;
var weekTime = require('../models').weekTime;

const sessionUrl = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.reqUrl = req.originalUrl;
    }
    next();
}

var ensureLoggedIn = ensureLogIn('/signin');
router.use(sessionUrl);
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
    statistics.numMCP = await getNumber(MCP);
    statistics.numCollector = await getNumber(Collector);
    statistics.numJanitor = await getNumber(Janitor);
    statistics.numVehicle = await getNumber(Route);
    statistics.numTroller = await getNumber(Janitor);
    statistics.numRoute = await getNumber(Route);
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
        schedule = await Tasks.find({week: cur, id:/^C[1-4]/}, {id: 1, route:1, vehicle:1, _id: 0});
        docsAssigned = await Tasks.find({week:cur, id:/^C[1-4]/, vehicle: null}, {id: 1, _id: 0});
        retAssign.Unassignee = docsUnassigned;
        retAssign.Schedule = schedule;
        docsfileter.type = 'Collector';
    }
    else {
        schedule = await Tasks.find({week: cur, id:/^J[0-9]{1,2}/}, {id: 1, mcp:1, troller:1, _id: 0});
        docsAssigned = await Tasks.find({week:cur, id:/^J[0-9]{1,2}/, troller: null}, {id: 1, _id: 0});
        retAssign.Unassignee = docsUnassigned;
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
// body: data (similar to data in assign-task.ejs), week
// send: result and last modified
router.post('/assign-task', async function(req, res, next){
    var tasks = req.body.data.schedule;
    var assignID;
    if (req.query.type === 'Collector'){
        assignID = Collector.find({}, {id: 1, _id: 0})
    }
    else {
        assignID = Janitor.find({}, {id: 1, _id: 0})
    }
    Tasks.deleteMany({week: req.query.week, id: {$in: assignID}});
    tasks.forEach(t => {
        var task = new Tasks({week: req.query.week, id: t.assignee, route: t.route, vehicle: t.vehicle});
        task.save(function(err){
            if (err) {
                res.status(400).send("Cannot saving");
            }
        });
    });
    var currentDate = new Date();
    weekTime.updateOne({week: parseInt(req.query.week)}, {lastModified: currentDate});
    res.send(currentDate)
});

// TO-DO: find and return task data of given week's previous week
// query: week
// send: data (similar to data in assign-task.ejs)
router.get('/assign-task/last-week', async function(req, res, next){
    var cur = req.query.week - 1;
    var employee = req.query.employee;
    var retAssign = {};
    var data = {};
    var docsfilter = {};
    var stt = await (await weekTime.find({})).at(0).status
    if (cur < 1 || stt != "done"){
        res.status(404).send('Cannot get last week');
        return ;
    }
    retAssign.week = cur;
    if (employee === "Collector"){
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

    const collectors = await Collector.find({});
    collectors.forEach(collector => {
        var task = new Tasks({week: latestWeek, id: collector.id, route: null, vehicle: null});
        task.save(function(err){
            if (err) {
                res.status(400).send("Cannot create task of new week");
            }
        });
    });

    const janitors = await Janitor.find({});
    janitors.forEach(janitor => {
        var task = new Tasks({week: latestWeek, id: janitor.id, mcp: null, troller: null});
        task.save(function(err){
            if (err) {
                res.status(400).send("Cannot create task of new week");
            }
        });
    });

    res.send({newWeek: latestWeek});
});

// TO-DO: render task history
// query: {(field): (value)}
router.get('/task-history', async function(req, res, next) {
    var name = null;
    if (req.query.name) {
        name = req.query.name;
        delete req.query.name;
    }
    const collectors = await Collector.find({});
    const janitors = await Janitor.find({}); 
    var employees = collectors.concat(janitors);
    var rows = await Tasks.find(req.query);
    rows = rows.map(row => {
        row = row.toObject();
        row.name = employees.find(employee => employee.id === row.id).name;
        return row;
    });
    rows.filter(row => row.name === name);
    res.render('task-history', { title: 'Task History' , rows: rows, filters: req.query});
});

module.exports = router;
