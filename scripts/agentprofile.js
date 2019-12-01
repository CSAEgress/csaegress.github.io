requirejs([
    "jquery",
    "ext/mgrs",
    "preloading",
], function(
    $,
    mgrs,
    GET_PRELOADING_RESOURCES
){
//----------------------------------------------------------------------------

function setCoordinate(obj){
    var coordinate = $(obj).attr("data-coordinate");
    if(!coordinate) return;

    coordinate = coordinate.split(",");
    coordinate = [parseFloat(coordinate[0]), parseFloat(coordinate[1])];

    var mgrsStr = mgrs.forward(coordinate, 2);

    var parts = /([0-9]{1,2}[A-Z])([A-Z]{2})([0-9]+)/.exec(mgrsStr);
    $(obj).find("span").html(
        "<a href='https://www.google.com/maps/search/?api=1&query=" + coordinate[0] + "," + coordinate[1] + "' target='_blank'>" +
        parts[1] + "-" + parts[2] + "-" + parts[3] +
        "</a>"
    )

}


$(function(){
    const agent_id = $("#agentid").attr("data-agentid");
    setTimeout(function(){setCoordinate("#coordinate");}, 1);

    GET_PRELOADING_RESOURCES("profiles")
    .then(function(data){
        data.forEach(function(agent){
            if(agent.agent_id != agent_id) return;
            if(agent.introduction && agent.introduction.trim()){
                $("#introduction").text(agent.introduction);
            }
        });
        $("#introduction").show();
    })
    .catch(function(){
        $("#introduction").show();
    });


});

console.log(mgrs);

//----------------------------------------------------------------------------
});
