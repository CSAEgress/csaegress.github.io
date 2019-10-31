---
# /* Make a front matter. This page requires constants defined in
#     /_data/preloading.yaml                                          */
---

define(["ext/localforage.min"], function(storage){
//////////////////////////////////////////////////////////////////////////////

const cache_time = {{ site.data.preloading.cache_time }} * 1000;
const nonce = "{{ site.data.preloading.nonce }}";
const resources = {
    // Resources to be cached.
    "calendar": "1eSFe8pE7i38arAI8owUC4pX3szrXv5bJX_MR9vObpYk",
    "profiles": "1Eo0fPdAioiKl7H58wI39lzJijakWfvcjywdyxgFczLg",
};
var cacheStatus = {};

// --------
// Function to turn a google sheet into an array of json.

function loadGoogleSheetData(sheetID){
    return new Promise(function(resolve, reject){
        $.ajax({
            url: "https://docs.google.com/spreadsheets/d/"
                + sheetID + "/edit#gid=0",
            timeout: 5000,
        })
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

function delay(duration){
    return new Promise(function(resolve, _){
        setTimeout(resolve, duration);
    });
}


async function verifyAndReadCache(item){
    const statusEntryID = item + ".status";
    const now = new Date().getTime();

    var statusEntry = null;
    for(var i=0; i<5; i++){
        try{
            statusEntry = await storage.getItem(statusEntryID);
            break;
        } catch(e){
            console.log(e);
            await delay(100);
        }
    }
    if(!statusEntry) return null;

    if(!(
        (statusEntry.nonce && statusEntry.nonce == nonce) &&
        (statusEntry.time && (now - statusEntry.time) <= cache_time)
    )){
        console.log(item, "cache invalid. removing...");
        // cache expired, clear cache and entry
        await storage.removeItem(item);
        await storage.removeItem(statusEntryID);
        return null;
    }

    var cache = await storage.getItem(item);
    return cache;
}

async function writeCache(item, data){
    const statusEntryID = item + ".status";
    const now = new Date().getTime();

    await storage.setItem(item, data);
    await storage.setItem(statusEntryID, {
        nonce: nonce,
        time: now
    });
}




const fetchPreloadingResource = async function(resourceName){
/* Binding function for GET_PRELOADED_RESOURCES
   
   Returns the cached resource, if cache is valid. Otherwise, returns a
   promise and initiate caching progress immediately.
   This function is also called on page loading automatically, to test if
   cache is available, and initiate preloading if required. */
    
    if(resources[resourceName] == undefined) return null;

    var cache = await verifyAndReadCache(resourceName);
    if(null != cache){
        console.log("Cache for", resourceName, "is found. Return.");
        return cache;
    }

    // else, download and cache this file
    console.log("Caching Google sheet: ", resourceName);
    var data = await loadGoogleSheetData(resources[resourceName]);
    await writeCache(resourceName, data);
    return data;
}

for(var item in resources){
    progress = fetchPreloadingResource(item);
}

return fetchPreloadingResource;
//////////////////////////////////////////////////////////////////////////////
});
