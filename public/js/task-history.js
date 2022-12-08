/* TO-DO: 
    - store filters same as in task-history.ejs
    - when click "Find", modified filters (add field and value, without duplicate field in filters) -> redirect to 
    /back-officer/task-history + url query parameters created from filters
    - when click "Delete" a filter, modified filters (remove field and value) -> redirect to 
    /back-officer/task-history + url query parameters created from filters
*/

const data = {
    "onButton": "Week",
    "hideData": ["ID", "Name", "Vehicle", "Route", "Troller", "MCP"] 
}

var tempData = data;

function changeEJS(tempData){
    const onButton = document.querySelector(".dropbtn");
    onButton.innerText = tempData.onButton;
    var choosetypes = document.querySelectorAll('.choosetype');
    for (var i=0; i<6; i++){
        choosetypes[i].innerText = (tempData.hideData)[i];
    }
}

const handle_click = (e) => {
    var name = e.target.innerText;
    // console.log(name);
    onButton = tempData.onButton;
    tempData.onButton = name;
    for (var i=0; i<6; i++){
        if ((tempData.hideData)[i] === name){
            (tempData.hideData)[i] = onButton;
        }
    }
    changeEJS(tempData);
}

const choosetypes = document.querySelectorAll('.choosetype');
choosetypes.forEach((choosetype) => {
    choosetype.addEventListener("click", handle_click);
});


const query = [];

function updateData(q, key){
    var obj = [q, key];
    query = query.filter(que => que[0] != q);
    query.push(obj);
    const url = new URL(document.location);
    var str = ``;
    for (var i=0; i<query.length; i++){
        if (i === 0) str += `?${query[i][0].toLowerCase()}=${query[i][1]}`;
        else str += `&${query[i][0].toLowerCase()}=${query[i][1]}`;
    }
    window.location.href = url.pathname + str;
}

function rm(){
    query.pop();
    const url = new URL(document.location);
    var str = ``;
    for (var i=0; i<query.length; i++){
        if (i === 0) str += `${query[i][0].toLowerCase()}=${query[i][1]}`;
        else str += `&${query[i][0].toLowerCase()}=${query[i][1]}`;
    }
    window.location.href = url.pathname + str;
}

const keyword = document.getElementById('keyword');
// name: John, mcp: M2
// ?name=John&mcp=M2
const searchs = document.querySelectorAll('.search');
searchs.forEach(search => {
    search.addEventListener("click", () => {
        var q = tempData.onButton;
        var key = keyword.value;
        const url = new URL(document.location);
        if (key !== "") updateData(q, key);
    })
});


//filter_remove
const removes = document.querySelectorAll('.filter_remove');
removes.forEach(remove => {
    remove.addEventListener("click", () => {
        rm();
    })
});
  
