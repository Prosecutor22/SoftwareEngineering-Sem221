// var unassign = [{"id":"C1"},{"id":"C2"},{"id":"C3"},{"id":"C4"}];
// var assigned = [{"id":"C1"},{"id":"C2"}];
// var assign = [];
// unassign.forEach(element => {
//     if (assigned.find(e => e.id === element.id) === undefined) assign.push(element.id);
// });
// console.log(assign);

async function test() {
    t = await Tasks.updateMany({week: "3", id: "C1"}, {$set:{route: "R1", vehicle: "V1"}})
    console.log(t)
    t = await Tasks.updateMany({week: "3", id: "C2"}, {$set:{route: "R2", vehicle: "V2"}})
    console.log(t)
    t = await Tasks.updateMany({week: "3", id: "C3"}, {$set:{route: "R3", vehicle: "V3"}})
    console.log(t)
    t = await Tasks.updateMany({week: "3", id: "C4"}, {$set:{route: "R4", vehicle: "V4"}})
    console.log(t)
}
var Tasks = require('./models').Tasks;

test()
