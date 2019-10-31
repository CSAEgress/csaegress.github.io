define(["ext/leaflet"], function(L){
//////////////////////////////////////////////////////////////////////////////

var map; 

const MARKERS = {
    "enl": L.icon({
        iconUrl: "/css/images/marker-star-enl.png",
        iconSize: [54, 54],
        iconAnchor: [27, 27],
    }),
    "res": L.icon({
        iconUrl: "/css/images/marker-star-res.png",
        iconSize: [54, 54],
        iconAnchor: [27, 27],
    }),
};



function resetAgentNameLabelVisibility(){
    $(".leaflet-tooltip").css("opacity", (
        map.getZoom() >= 6 ? "1.0" : "0.0")
    );
}


function init(center){
    map = L.map("map", {
        minZoom: 2,
        maxBounds: [ [-90,-181], [90, 181] ],
    }).setView(center, 4);
    
    var cartoAttr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
    var cartoUrl = 'https://{s}.basemaps.cartocdn.com/{theme}/{z}/{x}/{y}.png';
    L.tileLayer(cartoUrl,{attribution:cartoAttr,theme:'dark_all'}).addTo(map);

    map.on("zoomend", resetAgentNameLabelVisibility);
}


function refresh(){
    resetAgentNameLabelVisibility();
}


var agents = {};
var agentNameLabels = {};
function agent(options){
    const agent_id = options.agent_id;
    const coordinate = options.coordinate;

    if(agents[agent_id] == undefined){
        console.debug("Create:", agent_id);

        agents[agent_id] = L.marker(coordinate, {
            icon: MARKERS[options.faction],
            title: agent_id,
            alt: agent_id,
        })
        .bindPopup(
            '<a target="_blank" href="/agents/' + agent_id.toLowerCase()
            + '"/>' + agent_id + '</a>')
        .addTo(map);
        agentNameLabels[agent_id] = agents[agent_id].bindTooltip(agent_id, {
            permanent: true,
        });

        return;
    }

    var agentMarker = agents[agent_id];
    agentMarker.setOpacity(0);

    if(coordinate) agentMarker.setLatLng(coordinate);
    if(options.faction) agentMarker.setIcon(MARKERS[options.faction]);
    
    setTimeout(function(){ agentMarker.setOpacity(1); }, 1000);
}


return {
    init: init,
    agent: agent,
    refresh: refresh,
}

//////////////////////////////////////////////////////////////////////////////
});
