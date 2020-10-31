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
var sidebarElement;
var sidebarToggleElement;
var readerRootElement;
var chaptersRootElement;


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
    sidebarToggleElement = $("#toggle-sidebar");
    sidebarElement = $("#sidebar");
    readerRootElement = $("#reader-root");
    chaptersRootElement = $("#chapters-root");

    printElement.on("click", print);
    fullscreenElement.on("click", fullscreen);
    editElement.attr("href", `/books/edit?id=${id}`)
    sidebarToggleElement.on("click", toggleSidebar);
    downloadElement.attr("href", `/packages/book-hub/api/download.php?id=${id}&format=epub`)

    Searchbar.ready();

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
            book.ready.then(() =>
            {
                bookReady();
            })
            book.loaded.navigation.then(bookLoadedNavigation);

            rendition = book.renderTo(reader.get(0), {
                method: "continuous",
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
        else
        {
            Alert.error("Unable to load book");
        }
    };
    xhr.send();
}

function bookReady()
{
    $("#loader-root").remove();
    reader.css('background-color', 'white');

    document.addEventListener("keyup", onKeyUp, false);
    rendition.on("keyup", onKeyUp);

    $(readerRootElement).bind('mousewheel', onScroll);
    rendition.on("rendered", (e, i) =>
    {
        i.document.documentElement.addEventListener('keyup', onKeyUp, false);
        $(i.document.documentElement).bind('mousewheel', onScroll);
        Searchbar.renditionRendered(i.document);
    });

    rendition.on('relocated', (location) =>
    {
        setDatabasePage(location.start.cfi);
        updateChaptersActive(location.start.href);
    });

    getDatabasePage();
}

function bookLoadedNavigation(navigation)
{
    setupChaptersList(navigation.toc);
}

function setupChaptersList(toc)
{
    var list = ``;

    toc.forEach(item =>
    {
        var subitems = "";
        item.subitems.forEach(subitem =>
        {
            subitems += `<li class="chapters-list-subitem" id="chapters-list-item-${idSafe(subitem.id)}" onClick="goTo('${subitem.href}')">${subitem.label}</li>`;
        })

        list += `<li class="chapters-list-item" id="chapters-list-item-${idSafe(item.id)}" onClick="goTo('${item.href}')">${item.label}${subitems}</li>`;
    });

    chaptersRootElement.append(list);
}
function updateChaptersActive(href)
{
    var className = "chapters-list-item-active";
    var active = $("." + className);
    if (active)
    {
        active.removeClass(className);
    }
    $(`#chapters-list-item-${idSafe(href)}`).addClass(className);
}

function goToPage(cfi)
{
    rendition.display(cfi);
}
function goTo(id)
{
    rendition.display(id);
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

function openSidebar()
{
    sidebarElement.css("left", "0");
    readerRootElement.css("padding-left", "250px");
    sidebarToggleElement.addClass("open");

}
function closeSidebar()
{
    sidebarElement.css("left", "-250");
    readerRootElement.css("padding-left", "0px");
    sidebarToggleElement.removeClass("open");
}
function toggleSidebar()
{
    if (sidebarElement.css("left") == "0px")
    {
        closeSidebar();
    }
    else
    {
        openSidebar();
    }
}

function idSafe(id)
{
    return id.replace(/[^\w\s]/gi, '_')
}

class Searchbar
{
    static toggleElement;
    static inputElement;
    static searchbarElement;

    static ready()
    {
        Searchbar.toggleElement = $("#toggle-searchbar");
        Searchbar.inputElement = $("#searchbar-input");
        Searchbar.searchbarElement = $("#searchbar");

        Searchbar.toggleElement.on("click", Searchbar.toggle);
        Searchbar.inputElement.keyup(function (e)
        {
            if (e.keyCode == 13)
            {
                e.preventDefault();
                Searchbar.onEnterKeyDown();
            }
        });

        $(document).keydown(function (e)
        {
            if (e.keyCode == 27)
            {
                e.preventDefault();
                Searchbar.onEscapeKeyDown();
            }
        });

        $(document).keydown(function (e)
        {
            if (e.keyCode == 114)
            {
                e.preventDefault();
                Searchbar.onCtrlFKeyDown();
            }
            if (e.keyCode == 70)
            {
                e.preventDefault();
                Searchbar.onCtrlFKeyDown();
            }
        });
    }

    static onEscapeKeyDown()
    {
        if (Searchbar.isOpen())
        {
            Searchbar.close();
        }
    }
    static onCtrlFKeyDown()
    {
        Searchbar.open();
    }
    static onEnterKeyDown()
    {
        Searchbar.search();
    }

    static renditionRendered(document)
    {
        if (document != "undefined")
        {
            $(document).find("body").append(`
            <script>
                document.addEventListener("keydown", keydown, false);
                function keydown(e)
                {
                    if (e.keyCode == 114)
                    {
                        e.preventDefault();
                        parent.searchbarRelay.onCtrlFKeyDown();
                    }
                    if (e.keyCode == 70)
                    {
                        e.preventDefault();
                        parent.searchbarRelay.onCtrlFKeyDown();
                    }
                    if (e.keyCode == 27)
                    {
                        e.preventDefault();
                        parent.searchbarRelay.onEscapeKeyDown();
                    }
                }
            </script>`);
        }
    }

    static open()
    {
        Searchbar.searchbarElement.show();
        Searchbar.inputElement.val("");
        Searchbar.inputElement.focus();
    }
    static close()
    {
        Searchbar.searchbarElement.hide();
        Searchbar.clear();
    }
    static toggle()
    {
        if (Searchbar.isOpen())
        {
            Searchbar.close();
        }
        else
        {
            Searchbar.open();
        }
    }
    static isOpen()
    {
        return Searchbar.searchbarElement.css("display") != "none";
    }

    static async search()
    {
        Searchbar.clear();

        var query = Searchbar.inputElement.val();
        var highlights = [];
        for (let i = 0; i < book.spine.spineItems.length; i++)
        {
            const item = book.spine.spineItems[i];
            await item.load(book.load.bind(book));
            var result = item.find(query);
            result.forEach(element =>
            {
                highlights.push(element);
                rendition.annotations.highlight(element.cfi);
            });
        }
        console.log(highlights.length);
    }

    static clear()
    {
        rendition.annotations.removeAll();
    }
}
var searchbarRelay = {
    onCtrlFKeyDown()
    {
        Searchbar.onCtrlFKeyDown();
    },
    onEscapeKeyDown()
    {
        Searchbar.onEscapeKeyDown();
    }
}