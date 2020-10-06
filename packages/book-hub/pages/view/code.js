var id;
var totalPageCount = -1;
var pageOnLastUpdate = -1;
var updatingDatabasePage = false;
var currentPage = 1;
var statusElement;

$(document).ready(function()
{
    ready();
});

function ready()
{
    id = getUrlParameter("id");
    $("#iframe").attr('src', "/packages/book-hub/pdfjs/iframe.html?file=" + encodeURIComponent("/packages/book-hub/api/download.php?id=" + id));
}

function loadStarted(elements)
{
    console.log(1);
    $(elements["download"]).attr("href", "/packages/book-hub/api/download.php?id=" + id)
    $(elements["download-secondary"]).attr("href", "/packages/book-hub/api/download.php?id=" + id)
    $(elements["edit"]).attr("href", "/books/edit?id=" + id)
    $(elements["edit-secondary"]).attr("href", "/books/edit?id=" + id)
    
    statusElement = $(elements["status"]);
    statusElement.on("change", function()
    {
        onStatusChange();
    })
    updateStatusUI();
}
function loadDone()
{
    jumpToStartPage();
}


function setTotalPages(number)
{
    totalPageCount = number;
}

function onPageChange(number)
{
    if (totalPageCount == -1)
    {
        return;
    }
    currentPage = number;

    if(currentPage == totalPageCount && statusElement.val() != "finished")
    {
        statusElement.val("finished");
        onStatusChange();
    }

    if(currentPage != 1 && statusElement.val() == "unread")
    {
        statusElement.val("reading");
        onStatusChange();
    }
}

function pageNumberDatabaseUpdateTimer()
{
    setInterval(function()
    {
        if (currentPage != pageOnLastUpdate && !updatingDatabasePage)
        {
            updatingDatabasePage = true;
            var number = currentPage;
            var data = {
                id: id,
                page: number
            }
            API.simple("book-hub", "edit/page", data,
                function(result)
                {
                    if (result["success"] == true)
                    {
                        pageOnLastUpdate = number;
                        updatingDatabasePage = false;
                    }
                    else if (result["success"] == false)
                    {
                        Alert.error(result["message"]);
                    }
                },
                function(result)
                {
                    Alert.error("Something went wrong. See console (F12) for more info.");
                    console.log(result);
                }
            );
        }
    }, 1000);
}

function updateStatusUI()
{
    var data = {
        id: id
    }
    API.simple("book-hub", "view/status", data,
        function(result)
        {
            if (result["success"] == true)
            {
                var status = result["status"];
                statusElement.val(status);
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function(result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}

function onStatusChange()
{
    var data = {
        id: id,
        status: statusElement.val()
    }
    API.simple("book-hub", "edit/status", data,
        function(result)
        {
            if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function(result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}

function jumpToStartPage()
{
    var data = {
        id: id,
    }
    API.simple("book-hub", "view/page", data,
        function(result)
        {
            if (result["success"] == true)
            {
                var page = parseInt(result["page"]);
                document.getElementById('iframe').contentWindow.PDFViewerApplication.page = page;
                document.getElementById('iframe').contentWindow.PDFViewerApplication.pdfViewer.currentScaleValue = "page-fit";
                document.getElementById('iframe').contentWindow.PDFViewerApplication.pdfViewer.spreadMode = 0;
                pageOnLastUpdate = page;
                currentPage = page;
                setTimeout(pageNumberDatabaseUpdateTimer, 2000);
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function(result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++)
    {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam)
        {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}