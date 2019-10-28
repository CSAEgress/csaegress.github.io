/* For calendar.html */
$(function(){
//////////////////////////////////////////////////////////////////////////////

function getCellID(year, month, day){
    return "cell-" + year + "-" + month + "-" + day;
}


function newCellHTML(year, month, day){
    var innerHTML = [
        "<table class='calendar-cell' style='width:100%; padding:3px'>",
            "<tr class='calendar-cell-label'><td class='event-xma'>XMA</td><td class='event-md'>MD</td><td class='event-ifs'>IFS</td>",
            "<tr class='calendar-cell-day'><td colspan=3>" + day + "</td></tr>",
            "<tr class='calendar-cell-label'><td colspan=3 class='event-other'>NL1331</td></tr>",
        "</table>"
    ].join("");

    return "<td class=\"calendar-cell\" id=\"" + getCellID(year, month, day) + "\">"
    + innerHTML
    + "</td>";
}


function newMonthCard(year, month){
    var newCard = $("#calendar-template").clone();
    newCard.removeAttr("id");
    newCard.attr("id", "calendar-" + year + "-" + month);

    newCard.find('[name="year"]').text(year);
    newCard.find('[name="month"]').text(month);

    var cells = [];
    const daysMax = (month == 2 ?
        (year % 4 == 0 ? 
            (year % 100 == 0 ? 
                ( year % 400 == 0 ? 29 : 28 )
                :
                29
            )
            :
            28
        )
        :
        ( [1,3,5,7,8,10,12].includes(month) ? 31 : 30)
    );
    
    // offset
    var day1 = new Date(year, month-1, 1);
    for(var i=0; i<day1.getDay(); i++) cells.push(null);

    // all other legit days
    for(var day=1; day <= daysMax; day++){
        var date = new Date(year, month-1, day);
        cells.push(day);
    }

    // render to table
    var tablebody = [];
    var tablerow = [];
    var tbodyhtml = "";
    for(var i=0; i<cells.length; i++){
        if(cells[i] === null){
            tablerow.push("<td></td>");
        } else {
            tablerow.push(newCellHTML(year, month, cells[i]));
        }
        if(tablerow.length == 7){
            tablebody.push(tablerow);
            tablerow = [];
        }
    }
    tablebody.push(tablerow);
    for(var i=0; i<tablebody.length; i++){
        tbodyhtml += "<tr>" + tablebody[i].join("\n") + "</tr>";
    }

    newCard.find("tbody").html(tbodyhtml);

    return newCard;
}

function paddingZeros(i, total){
    var s = i.toString();
    return "000000000".slice(0, total-s.length) + s;
}

function onCalendarCellClicked(){
    var events = $(this).data("events");

    $(".modal-body").empty();
    

    events.forEach(function(e){
        $("<div>")
        .append($("<span>").text(
            paddingZeros(e.hour, 2) + ":" + paddingZeros(e.minute, 2)
        ).css("padding-right", "1em"))
        .append(
            $("<span>").text(e.location).css("padding-right", "1em")
        )
        .append($("<a>", {
            href: e.url || "#",
            target: (e.url?"_blank":"")
        }).text(e.type + " :: " + e.name))

        .appendTo(".modal-body");
    });
    
    $("#calendar-events-dialog span[name=\"year\"]").text(events[0].year);
    $("#calendar-events-dialog span[name=\"month\"]").text(events[0].month);
    $("#calendar-events-dialog span[name=\"day\"]").text(events[0].day);
    $("#calendar-events-dialog").modal("show");
}



async function init(){
    const now = new Date();
    var allCalendarEvents = await GET_CALENDAR_EVENTS();
    $("#loading").remove();

    // Set up month calendars
    var lastShownYear = -1, lastShownMonth = -1;
    var showingDate = now,
        showingDateEnd_getTime =
            allCalendarEvents[allCalendarEvents.length-1].date.getTime();
    while(showingDate.getTime() < showingDateEnd_getTime){
        if(!(
            lastShownYear == showingDate.getFullYear() &&
            lastShownMonth == showingDate.getMonth()
        )){
            $(newMonthCard(
                showingDate.getFullYear(),
                showingDate.getMonth() + 1
            )).appendTo("#calendar-cards");
            lastShownYear = showingDate.getFullYear();
            lastShownMonth = showingDate.getMonth();
        }
        showingDate = new Date(showingDate.getTime() + 86400000 * 15);
    }

    // Mark events on date
    allCalendarEvents.forEach(function(e){
        var hashCellID = "#" + getCellID(e.year, e.month, e.day);
        if(["XMA", "MD", "IFS"].includes(e.type)){
            $(hashCellID)
                .find(".event-" + e.type.toLowerCase())
                .css("opacity", "1.0")
            ;
        } else {
            $(hashCellID)
                .find(".event-other")
                .text(e.type)
                .css("opacity", "1.0")
            ;
        }
        if(!$(hashCellID).data("events")){
            $(hashCellID).click(onCalendarCellClicked).data("events", []);
        }
        $(hashCellID).data("events").push(e);
    });

    // mark today
    $("#" + getCellID(now.getFullYear(), now.getMonth()+1, now.getDate()))
        .addClass("calendar-today")
    ;
}

init();

//////////////////////////////////////////////////////////////////////////////
});
