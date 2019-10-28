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


async function init(){
    var allCalendarEvents = await GET_CALENDAR_EVENTS();

    // Set up month calendars
    var lastShownYear = -1, lastShownMonth = -1;
    allCalendarEvents.forEach(function(e){
        if(!(lastShownYear == e.year && lastShownMonth == e.month)){
            $(newMonthCard(e.year, e.month)).appendTo("#calendar-cards");
            lastShownYear = e.year;
            lastShownMonth = e.month;
        }
    });

    // Mark events on date
    allCalendarEvents.forEach(function(e){
        var cellID = getCellID(e.year, e.month, e.day);
        if(["XMA", "MD", "IFS"].includes(e.type)){
            $("#" + cellID)
                .find(".event-" + e.type.toLowerCase())
                .css("opacity", "1.0")
            ;
        } else {
            $("#" + cellID)
                .find(".event-other")
                .text(e.type)
                .css("opacity", "1.0")
            ;
        }
    });
}

init();

//////////////////////////////////////////////////////////////////////////////
});