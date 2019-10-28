const GET_CALENDAR_EVENTS = (function(){
//////////////////////////////////////////////////////////////////////////////
const sourcefile_id = "1eSFe8pE7i38arAI8owUC4pX3szrXv5bJX_MR9vObpYk";
function loadGoogleSheetData(sheetID){
    return new Promise(function(resolve, reject){
        $.get(
            "https://docs.google.com/spreadsheets/d/"
            + sheetID + "/edit#gid=0")
        .done(function(data){
            var trs = $(data).find(".waffle").find("tr");
            var rows = [];
            var trimSize = 0;

            trs.each(function(){
                var cells = [];
                $(this).find("td").each(function(){
                    cells.push($(this).text());
                });
                if(rows.length == 0){
                    while(cells.length > 0 && cells[cells.length-1] == ""){
                        cells.pop();
                    }
                    if(cells.length > 0) trimSize = cells.length;
                } else {
                    cells = cells.slice(0, trimSize);
                }

                if(cells.join("") != ""){
                    rows.push(cells);
                }
            });

            if(rows.length <= 1) return resolve([]);
            for(var i=1; i<rows.length; i++){
                var obj = {};
                for(var j=0; j<rows[i].length; j++){
                    obj[rows[0][j]] = rows[i][j];
                }
                rows[i] = obj;
            }
            resolve(rows.slice(1));
        })
        .fail(function(e){
            reject(e);
        });
    });
}




var events = [];
var eventsLoaded = false;

async function getAllEvents(){
    if(eventsLoaded) return events;
    events = await loadGoogleSheetData(sourcefile_id);
    for(var i=0; i<events.length; i++){
        events[i]["date"]  = new Date(events[i]["date"]);
        events[i]["year"]  = events[i]["date"].getFullYear();
        events[i]["month"] = events[i]["date"].getMonth() + 1;
        events[i]["day"]   = events[i]["date"].getDate();

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
})();
