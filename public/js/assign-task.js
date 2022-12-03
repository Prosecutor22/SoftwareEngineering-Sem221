/* TO-DO: 
    - store data same as in assign-task.ejs
    - when select week / collector / janitor, redirect to corresponding 
    /back-officer/assign-task + url query parameter (week&type)
    - when drag and drop to assign, modified data
    - when click "Save", send (method post) data to /back-officer/assign-task -> when get response, update last modified (maybe notify)
    - when click "Same as last week", get data from /back-officer/assign-task/last-week + url query parameter (week)
    -> when get response, update local data and corresponding state of drag and drop
    - when click "New week", send request to /back-officer/assign-task/new-week -> when get respone, 
    redirect to /back-officer/assign-task + url query parameter (week)
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

function renderRetAssign(data){

};

function renderCurrentDate(data){

};

function renderNewWeek(data){

};

function renderLastWeek(data){

}

fetch("/assign-task")
    .then(response => {
        return response.json();
    })
    .then(response => {
        if (typeof response === "Date"){
            renderCurrentDate(response);
        }
        else{
            renderRetAssign(response);
        }
    });

fetch("/assign-task/new-week")
    .then(response => {
        return response.json();
    })
    .then(response =>{
        renderNewWeek(response);
    });

fetch("/assign-task/last-week")
    .then(response =>{
        return response.json();
    })
    .then(response =>{
        renderLastWeek(response);
    });




