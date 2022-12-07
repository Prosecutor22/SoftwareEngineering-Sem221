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
    // res.send(statistics);
    res.render('dashboard', {
        title: 'Dashboard',
        numCollector: statistics.numCollector,
        numJanitor: statistics.numJanitor,
        numVehicle: statistics.numVehicle,
        numTroller: statistics.numTroller,
        numMCP: statistics.numMCP,
        numRoute: statistics.numRoute
    })
});

// TO-DO: render assign task
// query: week, type
router.get('/assign-task', async function(req, res, next) {
    var cur = req.query.week;
    if (!cur) {
        var curDate = new Date();
        var curWeek = (await weekTime.find({ startDay: { $lte: curDate } }).sort({ week: -1 })).at(0);
        if (curWeek.status != 'done'){
            await weekTime.updateMany({week: {$lte: curWeek.week}}, {status: 'done'});
        }
        cur = curWeek.week;
    }
    var retAssign = {};
    retAssign.week = cur;
    var docsfileter = {};
    docsfileter.week = cur;
    if (req.query.type == "collector") {
        schedule = await Tasks.find({week: cur, id:/^C[1-4]/}, {id: 1, route:1, vehicle:1, _id: 0});
        docsAssigned = await Tasks.find({week:cur, id:/^C[1-4]/, vehicle: null}, {id: 1, _id: 0});
        retAssign.Unassignee = docsAssigned;
        retAssign.Schedule = schedule;
        docsfileter.type = 'Collector';
    }
    else {
        schedule = await Tasks.find({week: cur, id:/^J[0-9]{1,2}/}, {id: 1, mcp:1, troller:1, _id: 0});
        docsAssigned = await Tasks.find({week:cur, id:/^J[0-9]{1,2}/, troller: null}, {id: 1, _id: 0});
        retAssign.Unassignee = docsAssigned;
        retAssign.Schedule = schedule;
        docsfileter.type = 'Janitor';
    }
    var lastMod = await weekTime.find({week:cur}, {lastModified:1, startDay:1, _id: 0});
    docsfileter.lastModified = lastMod.lastModified;
    docsfileter.startDay = lastMod.startDay;
    retAssign.filter = docsfileter;
    weeks = (await weekTime.find({},{week: 1, _id: 0})).map(e => e.week)
    //res.send(retAssign);
    // retAssign : week: .... , Unassignee: ....., Schedule: ...., docsfileter: .... 
    res.render('assign-task',{
        title: 'Assign Task',
        weeks: weeks,
        data: retAssign,    
        filter: docsfileter
    })
});

// TO-DO: save tasks in mongoDB
// body: data (similar to data in assign-task.ejs), week
// send: result and last modified
router.post('/assign-task', async function(req, res, next){
    var tasks = req.body.schedule.filter(e => e.assignee != null);
    if (req.query.type === 'Collector'){
        await Tasks.updateMany({week: req.query.week}, {route: null, vehicle: null});
        tasks.forEach(async (t) => {
            await Tasks.updateOne({week: req.query.week, id: t.assignee}, {route: t.route, vehicle: t.vehicle})
        });
    }
    else {
        await Tasks.updateMany({week: req.query.week}, {mcp: null, troller: null});
        tasks.forEach(async (t) => {
            await Tasks.updateOne({week: req.query.week, id: t.assignee}, {mcp: t.mcp, troller: t.troller});
        });
    }

    var currentDate = new Date();
    await weekTime.updateOne({week: parseInt(req.query.week)}, {lastModified: currentDate});
    weeks = (await weekTime.find({},{week: 1, _id: 0})).map(e => e.week)
    // res.render('assign-task', {
    //     title: 'Assign Task',
    //     weeks: weeks,
    //     data: req.body.data,    
    //     filter: {
    //         week: req.query.week,
    //         type: req.query.type,
    //         lastModified: currentDate,
    //         startDay: (await weekTime.find({week: parseInt(req.query.week)})).at(0).startDay,
    //     }
    // })
    res.send({
        result: "Success",
        lastModified: currentDate
    })
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
    var stt = (await weekTime.find({week: cur})).at(0).status;
    if (cur < 1 || stt === "in-progress"){
        res.status(404).send('Cannot get last week');
        return ;
    }
    if (employee === "Collector"){
        data.unassigned =[];
        data.schedule = await Tasks.find({week: cur, id:/^C[1-4]/}, {_id: 0});
    }
    else {
        data.unassigned =[];
        data.docsAssigned = await Tasks.find({week:cur, id:/^J[0-9]{1,2}/}, {_id: 0});
    }
    retAssign.title = 'Assign Task';
    retAssign.weeks = (await weekTime.find({},{week: 1, _id: 0})).map(e => e.week)
    retAssign.data = data;
    docsfilter.week = cur;
    docsfilter.type = employee;
    docsfilter.lastModified = (await weekTime.find({week: cur})).at(0).lastModified;
    docsfilter.startDay = (await weekTime.find({week: cur})).at(0).startDay;
    retAssign.filter = docsfilter;
    res.render('assign-task', retAssign);
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

    // res.render('assign-task', {
    //     title: 'Assign Task',
    //     weeks: (await weekTime.find({},{week: 1, _id: 0})).map(e => e.week),
    //     data: {
    //         unassigned: collectors.map(e => e.id),
    //         schedule: []
    //     },
    //     filter: {
    //         week: latestWeek,
    //         type: 'Collector',
    //         lastModified: currentDate,
    //         startDay: startWeek
    //     }
    // })
    res.status(201).json({latestWeek});
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
    var rows = await Tasks.find(req.query).sort({week: 1, id: 1});
    rows = rows.map(row => {
        row = row.toObject();
        row.name = employees.find(employee => employee.id === row.id).name;
        return row;
    });
    rows = rows.filter(row => row.mcp != null || row.route != null);
    if (name) {
        rows = rows.filter(row => row.name === name);
        req.query.name = name
    }
    res.render('task-history', { 
        title: 'Task History',
        rows: rows,
        filters: req.query
    });
});

module.exports = router;