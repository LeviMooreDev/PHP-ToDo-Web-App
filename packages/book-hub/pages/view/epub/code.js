var id;

//epubjs
var reader;
var book;
var rendition;
var displayed;

//elements
var downloadElement;
var editElement;
var fullscreenElement;
var printElement;
var statusElement;

//timers
var resizeTimer;
var setDatabasePageTimer;

$(document).ready(function ()
{
    ready();
});

function ready()
{
    id = getUrlParameter("id");
    statusElement = $("#status");
    printElement = $("#print");
    fullscreenElement = $("#fullscreen");
    editElement = $("#edit");
    downloadElement = $("#download");

    printElement.on("click", print);
    fullscreenElement.on("click", fullscreen);
    editElement.attr("href", `/books/edit?id=${id}`)
    downloadElement.attr("href", `/packages/book-hub/api/download.php?id=${id}&format=epub`)

    $("#loader-root").remove();
    load();
}

function load()
{
    reader = $("#reader");

    setStatusOptions();

    var xhr = new XMLHttpRequest();
    xhr.open("GET", `/packages/book-hub/api/download.php?id=${id}&format=epub`);
    xhr.responseType = "arraybuffer";
    xhr.onload = function ()
    {
        if (this.status === 200)
        {
            book = ePub(xhr.response);
            book.ready.then(done)

            rendition = book.renderTo(reader.get(0), {
                width: parseInt(reader.width()),
                height: parseInt(reader.height())
            });
            rendition.settings.spread = "none";
            rendition.themes.default({
                "p": {
                    "font-size": "large !important"
                },
                "body": {
                    "background-color": "white !important"
                }
            });

            displayed = rendition.display();

            $(window).resize(resize);
        }
        else{
            Alert.error("Unable to load book");
        }
    };
    xhr.send();
}

function done()
{
    $("#loader-root").remove();
    reader.css('background-color', 'white');

    document.addEventListener("keyup", onKeyUp, false);
    rendition.on("keyup", onKeyUp);

    $(window).bind('mousewheel', onScroll);
    rendition.on("rendered", (e, i) =>
    {
        i.document.documentElement.addEventListener('keyup', onKeyUp, false);
        $(i.document.documentElement).bind('mousewheel', onScroll);
    });

    rendition.on('relocated', (location) =>
    {
        setDatabasePage(location.start.cfi);
    });

    getDatabasePage();
}


function goToPage(cfi)
{
    rendition.display(cfi);
}

function getDatabasePage()
{
    var data = {
        id: id,
    }
    API.simple("book-hub", "view/epub-page", data,
        function (result)
        {
            if (result["success"] == true)
            {
                goToPage(result["page"]);
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
function setDatabasePage(cfi)
{
    clearTimeout(setDatabasePageTimer);
    setDatabasePageTimer = setTimeout(function ()
    {
        var data = {
            id: id,
            page: cfi
        }
        API.simple("book-hub", "edit/epub-page", data,
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
    }, 500);
}

function resize()
{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function ()
    {
        rendition.resize(
            parseInt(reader.width()),
            parseInt(reader.height())
        );
    }, 200);
}

function nextPage()
{
    book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
}
function prevPage()
{
    book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
}

function onKeyUp(e)
{
    // Right Key
    if ((e.keyCode || e.which) == 39)
    {
        nextPage();
    }

    // Left Key
    if ((e.keyCode || e.which) == 37)
    {
        prevPage();
    }
}
function onScroll(e)
{
    if (e.originalEvent.wheelDelta >= 0)
    {
        prevPage();
    }
    else
    {
        nextPage();
    }
}

function print()
{
    $("iframe").get(0).contentWindow.focus();
    $("iframe").get(0).contentWindow.print();
}

function fullscreen()
{
    var reader = $("#reader-root").get(0);
    if (reader.requestFullscreen)
    {
        reader.requestFullscreen();
    }
    else if (elem.webkitRequestFullscreen)
    { /* Safari */
        reader.webkitRequestFullscreen();
    }
    else if (elem.msRequestFullscreen)
    { /* IE11 */
        reader.msRequestFullscreen();
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