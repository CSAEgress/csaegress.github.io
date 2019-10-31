define(["preloading"], function(GET_PRELOADED_RESOURCES){
//////////////////////////////////////////////////////////////////////////////

var events = [];
var eventsLoaded = false;

async function getAllEvents(){
    if(eventsLoaded) return events;
    events = await GET_PRELOADED_RESOURCES("calendar");
    for(var i=0; i<events.length; i++){
        events[i]["date"]  = new Date(events[i]["date"]);
        events[i]["year"]  = events[i]["date"].getFullYear();
        events[i]["month"] = events[i]["date"].getMonth() + 1;
        events[i]["day"]   = events[i]["date"].getDate();
        events[i]["hour"]  = events[i]["date"].getHours();
        events[i]["minute"]  = events[i]["date"].getMinutes();

    }
    events.sort(function(a,b){
        if(a.date.getTime() != b.date.getTime())
            return a.date.getTime() > b.date.getTime();
        return a.name > b.name;
    });
    eventsLoaded = true;
    return events;
}

return async function(filter){
    var ret = [];
    if(!filter) filter = {};
    (await getAllEvents()).forEach(function(obj){
        for(var key in filter){
            if(obj[key] != filter[key]) return;
        }
        ret.push(obj);
    });
    return ret;
}

//////////////////////////////////////////////////////////////////////////////
});
