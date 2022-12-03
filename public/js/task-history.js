/* TO-DO: 
    - store filters same as in task-history.ejs
    - when click "Find", modified filters (add field and value, without duplicate field in filters) -> redirect to 
    /back-officer/task-history + url query parameters created from filters
    - when click "Delete" a filter, modified filters (remove field and value) -> redirect to 
    /back-officer/task-history + url query parameters created from filters
*/

var express = require('express');
const datelib = require('date-and-time');
const { response } = require('express');
var router = express.Router();
var MCP = require('../models').MCP;
var Collector = require('../models').Collector;
var Janitor = require('../models').Janitor;
var Route = require('../models').Route;
var Tasks = require('../models').Tasks;
var weekTime = require('../models').weekTime;

function renderTaskHistory(data){

}

fetch('/task-history')
    .then(response => {
        return response.json();
    })
    .then(response =>{
        renderTaskHistory(response);
    })