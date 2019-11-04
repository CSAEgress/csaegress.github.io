define(["ext/leaflet"], function(L){
//////////////////////////////////////////////////////////////////////////////

var map; 

const MARKERS_HALFSIZE = 24;
const MARKERS = {
    "enl": L.icon({
        iconUrl: "/css/images/marker-star-enl-2.png",
        iconSize: [MARKERS_HALFSIZE*2,MARKERS_HALFSIZE*2],
        iconAnchor: [MARKERS_HALFSIZE*2, MARKERS_HALFSIZE*2],
    }),
    "res": L.icon({
        iconUrl: "/css/images/marker-star-res-2.png",
        iconSize: [MARKERS_HALFSIZE*2,MARKERS_HALFSIZE*2],
        iconAnchor: [MARKERS_HALFSIZE*2, MARKERS_HALFSIZE*2],
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


    setTimeout(function(){
        var cartoAttr = [
            '&copy; <a href="http://www.freepik.com">Freepik</a>',
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            '&copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        ].join(", ");
        var cartoUrl = 'https://{s}.basemaps.cartocdn.com/{theme}/{z}/{x}/{y}.png';
        L.tileLayer(cartoUrl,{attribution:cartoAttr,theme:'dark_all'}).addTo(map);
    }, 1);

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

    if(coordinate) agentMarker.setLatLng(coordinate);
    if(options.faction) agentMarker.setIcon(MARKERS[options.faction]);
    
}


return {
    init: init,
    agent: agent,
    refresh: refresh,
}

//////////////////////////////////////////////////////////////////////////////
});
