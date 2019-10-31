---
# /* make this a front matter, to load AGENTS from site static data */
---
require(["preloading", "agentsmap.map"], function(GET_PRELOADED_RESOURCE, map){

    function sanitizeAgentData(agent){
        if(agent.coordinate){
            var coordinate = agent.coordinate.split(",");
            coordinate = [parseFloat(coordinate[0]), parseFloat(coordinate[1])];
            agent.coordinate = coordinate;
        }
        if(agent.faction){
            agent.faction = (
                agent.faction.toLowerCase().trim()[0] == "r" ? "res": "enl"
            );
        }

        return agent;
    }

    var AGENTS = {
        {% for agent in site.agents %}
            "{{ agent.agent_id }}": sanitizeAgentData({
                "faction": "{{ agent.faction }}",
                "coordinate": "{{ agent.coordinate }}"
            }),
        {% endfor %}
    };

    $(function(){

//////////////////////////////////////////////////////////////////////////////

const AGENT_COORDINATES = (function(){
    var ret = {};    
    for(var agent_id in AGENTS){
        if(AGENTS[agent_id].coordinate){
            ret[agent_id] = AGENTS[agent_id].coordinate;
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


map.init(DEFAULT_CENTER);

for(var agent_id in AGENTS){
    if(!AGENT_COORDINATES[agent_id]) continue;
    map.agent({
        agent_id: agent_id,
        coordinate: AGENT_COORDINATES[agent_id],
        faction: AGENTS[agent_id].faction,
    });
};

map.refresh();


// --------
// Load data from Google Spreadsheet
GET_PRELOADED_RESOURCE("profiles").then(function(data){
    data.forEach(updateAgent);
    map.refresh();
});

function updateAgent(agent){
    if(!agent.agent_id) return;
    if(!AGENT_COORDINATES[agent.agent_id] && !agent.coordinate) return;
    if(!AGENTS[agent.agent_id] && !agent.faction) return;

    var update = { agent_id: agent.agent_id };
    if(agent.coordinate) update.coordinate = agent.coordinate;
    if(agent.faction) update.faction = agent.faction;

    map.agent(sanitizeAgentData(update));
    console.log("update agent:", agent.agent_id, update);
}




//////////////////////////////////////////////////////////////////////////////
});

});
