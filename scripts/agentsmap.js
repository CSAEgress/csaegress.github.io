require(["ext/leaflet"], function(L){

$(function(){

//////////////////////////////////////////////////////////////////////////////

const AGENT_COORDINATES = (function(){
    var ret = {};    
    for(var agent_id in AGENTS){
        var agent = AGENTS[agent_id];
        if(agent.coordinate){
            var coordinate = agent.coordinate.split(",");
            coordinate = [parseFloat(coordinate[0]), parseFloat(coordinate[1])];
            ret[agent_id] = coordinate;
        }
    }
    return ret;
})();

const DEFAULT_CENTER = (function(){
    var lat=0, lng=0, n=0;
    for(var agent_id in AGENT_COORDINATES){
        if(Math.abs(AGENT_COORDINATES[agent_id][1]) > 30) continue;
        lat += AGENT_COORDINATES[agent_id][0];
        lng += AGENT_COORDINATES[agent_id][1];
        n += 1;
    }
    return [lat/n, lng/n];
})();

const MARKERS = {
    "enl": L.icon({
        iconUrl: "/css/images/marker-enl.png",
        iconAnchor: [12, 41],
    }),
    "res": L.icon({
        iconUrl: "/css/images/marker-res.png",
        iconAnchor: [12, 41],
    }),
};


var map = L.map("map").setView(DEFAULT_CENTER, 4);


var cartoAttr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
var cartoUrl = 'https://{s}.basemaps.cartocdn.com/{theme}/{z}/{x}/{y}.png';
L.tileLayer(cartoUrl,{attribution:cartoAttr,theme:'dark_all'}).addTo(map);

/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);*/


var agentNameLabels = [];

for(var agent_id in AGENTS){
    var agent = AGENTS[agent_id];
    if(AGENT_COORDINATES[agent_id]){
        var marker = L.marker(AGENT_COORDINATES[agent_id], {
            icon: MARKERS[agent.faction],
            title: agent_id,
            alt: agent_id,
        })
        .bindPopup('<a target="_blank" href="/agents/' + agent_id.toLowerCase() + '"/>' + agent_id + '</a>')
        .addTo(map)
        ;

        agentNameLabels.push(marker.bindTooltip(agent_id, {
            permanent: true,
        }));
    }
};

function resetAgentNameLabelVisibility(){
    $(".leaflet-tooltip").css("opacity", (
        map.getZoom() >= 6 ? "1.0" : "0.0")
    );
}

map.on("zoomend", resetAgentNameLabelVisibility);
resetAgentNameLabelVisibility();

//////////////////////////////////////////////////////////////////////////////
});

});
