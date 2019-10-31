define(
    ["preloading", "ext/sort-by.min"],
    function(GET_PRELOADED_RESOURCES, sortBy){
//////////////////////////////////////////////////////////////////////////////

/*function parseISO(str){
    var dateMatch = /([0-9]{4})\-(0[1-9]|1[0-2])\-([0-3][0-9])/.exec(str);
    if(!dateMatch) return null;
    var year  = parseInt(dateMatch[1]),
        month = parseInt(dateMatch[2]),
        day   = parseInt(dateMatch[3]);
    var hour = 0, minute = 0, second = 0, timezone = 0;

    var timeMatch = /T([0-9]{2}(:[0-9]{2}){1,2})([\-\+][0-9]{2}:?[0-9]{2}|Z)/
        .exec(str);
    if(timeMatch){
        var timeStr = timeMatch[1], timezoneStr = timeMatch[3];
        var splitTime = /([0-9]{2}):([0-9]{2})(:([0-9]{2}))?/.exec(timeStr);
        hour   = parseInt(splitTime[1]);
        minute = parseInt(splitTime[2]);
        if(splitTime[4] != undefined) second = parseInt(splitTime[4]);

        if(timezoneStr != "Z"){
            var sign = (timezoneStr[0] == "+" ? 1 : -1);
            timezoneStr = timezoneStr.replace(/[^0-9]/g, "");
            var timezoneHH = parseInt(timezoneStr.slice(0, 2));
            var timezoneMM = parseInt(timezoneStr.slice(2, 4));
            timezone = sign * (timezoneHH * 3600 + timezoneMM * 60) * 1000;
        }
    }

    var date0 = new Date();
    date0.setUTCMilliseconds(0); date0.setUTCSeconds(second);
    date0.setUTCFullYear(year); date0.setUTCMonth(month-1);
    date0.setUTCDate(day); date0.setUTCHours(hour); date0.setUTCMinutes(minute);
    
    return new Date(date0.getTime() - timezone);
}*/



var events = [];
var eventsLoaded = false;

async function getAllEvents(){
    if(eventsLoaded) return events;
    events = await GET_PRELOADED_RESOURCES("calendar");
    for(var i=0; i<events.length; i++){
//        events[i]["date"]  = parseISO(events[i]["date"]);
        events[i]["date"]  = new Date(events[i]["date"]);
        events[i]["year"]  = events[i]["date"].getFullYear();
        events[i]["month"] = events[i]["date"].getMonth() + 1;
        events[i]["day"]   = events[i]["date"].getDate();
        events[i]["hour"]  = events[i]["date"].getHours();
        events[i]["minute"]  = events[i]["date"].getMinutes();
        events[i]["timestamp"] = events[i]["date"].getTime();

    }
    sortBy(events, function(item){ return item.timestamp; });
/*    events.sort(function(a,b){
        if(a.timestamp != b.timestamp) return a.timestamp > b.timestamp;
        return a.name > b.name;
    });*/ // Opera and some shitty browser cannot run this!
    eventsLoaded = true;
    return events;
}

return getAllEvents;
/*async function(filter){
    var ret = [];
    if(!filter) filter = {};
    (await getAllEvents()).forEach(function(obj){
        for(var key in filter){
            if(obj[key] != filter[key]) return;
        }
        ret.push(obj);
    });
    return ret;
}*/

//////////////////////////////////////////////////////////////////////////////
});
