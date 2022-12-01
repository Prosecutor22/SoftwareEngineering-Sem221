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
    /back-officer/task-history + url query parameters created from filters
*/