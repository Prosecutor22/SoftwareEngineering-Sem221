/* TO-DO: 
    - store data same as in assign-task.ejs
    - when select week / collector / janitor, redirect to corresponding 
    /back-officer/assign-task + url query parameter (week&type)
    - when drag and drop to assign, modified data
    - when click "Save", send (method post) data to /back-officer/assign-task + url query parameter (week&type)
    -> when get response, update last modified (maybe notify)
    - when click "Same as last week", get data from /back-officer/assign-task/last-week + url query parameter (week)
    -> when get response, update local data and corresponding state of drag and drop
    - when click "New week", send request to /back-officer/assign-task/new-week -> when get respone, 
    redirect to /back-officer/assign-task + url query parameter (week)
*/

const createRow = (id) => {
    const item = document.getElementById(id);
    item.classList.add('unassigned');
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.classList.add("Actor");
    td.appendChild(item);
    tr.appendChild(td);
    return tr;
}

const employees = document.querySelectorAll('.employee');
console.log(employees.length);

const dragstart_handler = (e) => {
    e.dataTransfer.setData('id', e.target.id);
    e.dataTransfer.setData('status', e.target.classList.contains('unassigned')? 'unassigned':'assigned')
}

const dragover_handler = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

const drop_handler = (e) => {
    e.preventDefault();
    var id = e.dataTransfer.getData("id");
    var status = e.dataTransfer.getData('status');
    console.log(id, status);
    if (e.target.id === "unassignedZone" && status === 'assigned') 
        e.target.appendChild(createRow(id));
    else if (e.target.classList.contains('assignedZone') && status === 'unassigned') {
        const item = document.getElementById(id);
        const tr = item.parentElement.parentElement;
        item.classList.remove('unassigned');

        if (e.target.children.length !== 0) {
            const targetItem = e.target.children[0];
            const targetID = targetItem.id;
            const trPar = tr.parentElement;
            trPar.appendChild(createRow(targetID));
        }
        
        e.target.appendChild(item);
        tr.remove();

    } else if (e.target.classList.contains('assignedZone') && status === 'assigned') {
        const item = document.getElementById(id);
        const parentItem = item.parentElement;

        if (e.target.children.length !== 0) {
            const targetItem = e.target.children[0];
            parentItem.appendChild(targetItem);
        }
        e.target.appendChild(item);
    }
}

employees.forEach(employee => employee.addEventListener('dragstart', dragstart_handler));

const unassignedZone = document.getElementById('unassignedZone');
unassignedZone.addEventListener('dragover', dragover_handler);
unassignedZone.addEventListener('drop', drop_handler);

const assignedZones = document.querySelectorAll('.assignedZone');
console.log(assignedZones.length);
assignedZones.forEach(assignedZone => {
    assignedZone.addEventListener('dragover', dragover_handler);
    assignedZone.addEventListener('drop', drop_handler);
})