var unassign = [{"id":"C1"},{"id":"C2"},{"id":"C3"},{"id":"C4"}];
var assigned = [{"id":"C1"},{"id":"C2"}];
var assign = [];
unassign.forEach(element => {
    if (assigned.find(e => e.id === element.id) === undefined) assign.push(element.id);
});
console.log(assign);