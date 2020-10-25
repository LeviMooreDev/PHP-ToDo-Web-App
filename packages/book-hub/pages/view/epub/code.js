var id;
var reader;
var book;
var rendition;
var displayed;

var resizeTimer;
var setDatabasePageTimer;

$(document).ready(function ()
{
    id = getUrlParameter("id");
    load();
});

function load()
{
    reader = $("#reader");
    book = ePub(`/packages/book-hub/books/${id}/book.epub`);
    rendition = book.renderTo(reader.get(0),
        {
            width: parseInt(reader.width()),
            height: parseInt(reader.height())
        });
    rendition.settings.spread = "none";
    displayed = rendition.display();

    $(window).resize(resize);

    rendition.themes.default({
        "p": {
            "font-size": "large !important"
        },
        "body": {
            "background-color": "white !important"
        }
    });

    book.ready.then(done)
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