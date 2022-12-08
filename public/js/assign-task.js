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
assignedZones.forEach(assignedZone => {
    assignedZone.addEventListener('dragover', dragover_handler);
    assignedZone.addEventListener('drop', drop_handler);
});

var scheduleTable = document.getElementById("schedule");

const getData = () => {
    const data = {};
    const schedule = [];
    const params = (new URL(document.location)).searchParams;
    const type = params.get('type');
    console.log(type);

    for (let i = 0; i < scheduleTable.children.length; i++) {
        let row = scheduleTable.children[i];
        const task = {};
        if (type === 'Collector') {
            task.route = row.children[0].innerText;
            task.vehicle = row.children[1].innerText;
        } else {
            task.troller = row.children[1].innerText;
            task.mcp = row.children[0].innerText;
        }

        if (row.children[2].children.length === 0) task.id = null;
        else task.id = row.children[2].children[0].innerText;

        schedule.push(task);
    };

    data.schedule = schedule;
    data.unassigned = [];

    const unassignedEmployees = document.querySelectorAll('.unassigned');
    unassignedEmployees.forEach(employee => data.unassigned.push(employee.innerText));

    // console.log(data);
    return data;
}

const saveButton = document.getElementById('save');
saveButton.addEventListener('click', async () => {
    const data = getData();
    const url = new URL(document.location);
    var response = await fetch(url.pathname + url.search, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    response = await response.json();
    // console.log(response);

    const time = document.getElementById('time');
    time.innerText = `Last modified: ${response.lastModified}`;
    alert("Saved successfully!");
});

const selectWeeks = document.querySelectorAll('.menuWeek li');
selectWeeks.forEach(selectWeek => {
    selectWeek.addEventListener('click', () => {
        const url = new URL(document.location);
        const params = url.searchParams;
        const week = selectWeek.innerText.split(' ')[1]
        const type = params.get('type');
        window.location.href = url.pathname + `?week=${week}&type=${type}`;
    })
});

const selectTypes = document.querySelectorAll('.menuType li');
selectTypes.forEach(selectType => {
    selectType.addEventListener('click', () => {
        const url = new URL(document.location);
        const params = url.searchParams;
        const week = params.get('week');
        const type = selectType.innerText;
        window.location.href = url.pathname + `?week=${week}&type=${type}`;
    })
});

const createButton = (id, isUnassigned) => {
    const btn = document.createElement('button');
    btn.setAttribute('draggable', 'true');
    btn.classList.add('employee');
    if (isUnassigned) btn.classList.add('unassigned');
    btn.id = id;
    btn.innerText = id;
    btn.addEventListener('dragstart', dragstart_handler);
    return btn;
}

const setData = (data) => {
    unassignedZone.innerHTML = '';
    data.unassigned.forEach(id => {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.classList.add('Actor');
        td.appendChild(createButton(id, true));
        tr.appendChild(td);
        unassignedZone.appendChild(tr);
    });

    scheduleTable = document.getElementById("schedule");
    scheduleTable.innerHTML = '';

    const url = new URL(document.location);
    const params = url.searchParams;
    const type = params.get('type');
    data.schedule.forEach(task => {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.classList.add('col');
        td.innerText = type === "Collector"? task.route:task.troller;
        tr.appendChild(td);

        const td2 = document.createElement('td');
        td2.classList.add('col');
        td2.innerText = type === "Collector"? task.vehicle:task.mcp;
        tr.appendChild(td2);

        const td3 = document.createElement('td');
        td3.classList.add('Actor');
        td3.classList.add('assignedZone');
        td3.addEventListener('dragover', dragover_handler);
        td3.addEventListener('drop', drop_handler);
        if (task.id !== null) td3.appendChild(createButton(task.id, false));
        tr.appendChild(td3);

        scheduleTable.appendChild(tr);
    });
}

const sameCheckBox = document.getElementById("same");
sameCheckBox.addEventListener('change', async (e) => {
    if (e.target.checked) {
        const url = new URL(document.location);
        const params = url.searchParams;
        const week = params.get('week');
        const type = params.get('type');

        var response = await fetch(`/back-officer/assign-task/last-week?week=${week}&type=${type}`);
        response = await response.json();

        setData(response.data);
    }
});

const newWeekBtn = document.getElementById('newWeek');
newWeekBtn.addEventListener('click', async () => {
    var response = await fetch('/back-officer/assign-task/new-week');
    response = await response.json();

    const url = new URL(document.location);
    const params = url.searchParams;
    const type = params.get('type');

    window.location.href = url.pathname + `?week=${response.latestWeek}&type=${type}`;
});

// const url = new URL(document.location);
// console.log(url.pathname + url.search);