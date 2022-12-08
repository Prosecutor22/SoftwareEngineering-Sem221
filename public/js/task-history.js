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
    console.log(name);
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

const search = document.querySelector('.search');
search.addEventListener("click", () => {
    const url = new URL(document.location);
    //window.location.href = url.pathname + `&q=${tempData.onButton}`;
});

