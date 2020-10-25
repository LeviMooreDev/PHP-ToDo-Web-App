var id;
var iframe;
var totalPageCount = -1;
var pageOnLastUpdate = -1;
var updatingDatabasePage = false;
var currentPage = 1;
var statusElement;

$(document).ready(function ()
{
    id = getUrlParameter("id");
    load();
});

function load()
{
    iframe = $("iframe");
    iframe.attr('src', "/packages/book-hub/pdfjs/iframe.html?file=" + encodeURIComponent("/packages/book-hub/api/download.php?id=" + id));
}

function setElements(elements)
{
    $(elements["download"]).attr("href", "/packages/book-hub/api/download.php?id=" + id)
    $(elements["download-secondary"]).attr("href", "/packages/book-hub/api/download.php?id=" + id)
    $(elements["edit"]).attr("href", "/books/edit?id=" + id)
    $(elements["edit-secondary"]).attr("href", "/books/edit?id=" + id)

    statusElement = $(elements["status"]);
    setStatusOptions();
}
function done()
{
    $("#loader-root").remove();
    iframe.show();
    iframe.focus();
    jumpToStartPage();
}

function jumpToStartPage()
{
    var data = {
        id: id,
    }
    API.simple("book-hub", "view/pdf-page", data,
        function (result)
        {
            if (result["success"] == true)
            {
                var page = parseInt(result["page"]);
                iframe.get(0).contentWindow.PDFViewerApplication.page = page;
                iframe.get(0).contentWindow.PDFViewerApplication.pdfViewer.currentScaleValue = "page-fit";
                iframe.get(0).contentWindow.PDFViewerApplication.pdfViewer.spreadMode = 0;

                pageOnLastUpdate = page;
                currentPage = page;
                setTimeout(setDatabasePage, 2000);
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function (result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}

function setDatabasePage()
{
    setInterval(function ()
    {
        if (currentPage != pageOnLastUpdate && !updatingDatabasePage)
        {
            updatingDatabasePage = true;
            var number = currentPage;
            var data = {
                id: id,
                page: number
            }
            API.simple("book-hub", "edit/pdf-page", data,
                function (result)
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
                function (result)
                {
                    Alert.error("Something went wrong. See console (F12) for more info.");
                    console.log(result);
                }
            );
        }
    }, 1000);
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

    if (currentPage == totalPageCount && statusElement.val() != "finished")
    {
        statusElement.val("finished");
        onStatusChange();
    }

    if (currentPage != 1 && statusElement.val() == "unread")
    {
        statusElement.val("reading");
        onStatusChange();
    }
}


function setStatusOptions()
{
    API.simple("book-hub", "view/all-status", "",
        function (result)
        {
            if (result["success"] == true)
            {
                var options = result["options"];
                var html = "";
                options.forEach(option =>
                {
                    html += `<option value="${option}">${toTitleCase(option)}</option>`;
                });
                statusElement.html(html);
                setStatusSelected();
            }
            else if (result["success"] == false)
            {
                console.log(result["message"]);
                Alert.error("Unable to get status options. Server error.");
            }
        },
        function (result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}
function setStatusSelected()
{
    var data = {
        id: id
    }
    API.simple("book-hub", "view/status", data,
        function (result)
        {
            if (result["success"] == true)
            {
                var status = result["status"];
                statusElement.val(status);

                statusElement.on("change", function ()
                {
                    onStatusChange();
                })
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function (result)
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
        function (result)
        {
            if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function (result)
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
function toTitleCase(str)
{
    return str.replace(
        /\w\S*/g,
        function (txt)
        {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}