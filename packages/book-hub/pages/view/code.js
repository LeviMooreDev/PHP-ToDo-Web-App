$(document).ready(function ()
{
    ready();
});

var loaderElement;
var useRootElement;
var viewerRootElement;

function ready()
{
    id = getUrlParameter("id");

    loaderElement = $("#loader-root");
    useRootElement = $("#use-root");
    viewerRootElement = $("#viewer-root");

    $("#use-pdf").on("click", function ()
    {
        loaderElement.show();
        useRootElement.remove();
        setTimeout(function () { PDFLoader.load(id); }, 200);

    });
    $("#use-epub").on("click", function ()
    {
        loaderElement.show();
        useRootElement.remove();
        setTimeout(function () { EPUBLoader.load(id); }, 200);
    });
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

class EPUBLoader
{
    static viewer;
    static book;
    static rendition;
    static displayed;

    static resizeTimer;

    static load(id)
    {
        viewerRootElement.html(`
        <div id="epub-viewer-root" class="d-flex justify-content-center">
            <div id="epub-viewer"></div>
        </div>`);

        EPUBLoader.viewer = $("#epub-viewer");
        EPUBLoader.book = ePub(`/packages/book-hub/books/${id}/book.epub`);
        EPUBLoader.rendition = EPUBLoader.book.renderTo(EPUBLoader.viewer.get(0),
            {
                width: parseInt(EPUBLoader.viewer.width()),
                height: parseInt(EPUBLoader.viewer.height())
            });
        EPUBLoader.rendition.settings.spread = "none";
        EPUBLoader.displayed = EPUBLoader.rendition.display();

        $(window).resize(EPUBLoader.resize);

        EPUBLoader.rendition.themes.default({
            "p": {
                "font-size": "large !important"
            },
            "body": {
                "background-color": "white !important"
            }
        });

        EPUBLoader.book.ready.then(EPUBLoader.done)
    }

    static done()
    {
        loaderElement.hide();
        EPUBLoader.viewer.css('background-color', 'white');

        document.addEventListener("keyup", EPUBLoader.onKeyUp, false);
        EPUBLoader.rendition.on("keyup", EPUBLoader.onKeyUp);

        $(window).bind('mousewheel', EPUBLoader.onScroll);
        EPUBLoader.rendition.on("rendered", (e, i) =>
        {
            i.document.documentElement.addEventListener('keyup', EPUBLoader.onKeyUp, false);
            $(i.document.documentElement).bind('mousewheel', EPUBLoader.onScroll);
        });
    }

    static resize()
    {
        clearTimeout(EPUBLoader.resizeTimer);
        EPUBLoader.resizeTimer = setTimeout(function ()
        {
            EPUBLoader.rendition.resize(
                parseInt(EPUBLoader.viewer.width()),
                parseInt(EPUBLoader.viewer.height())
            );
        }, 200);
    }

    static nextPage()
    {
        EPUBLoader.book.package.metadata.direction === "rtl" ? EPUBLoader.rendition.prev() : EPUBLoader.rendition.next();
    }
    static prevPage()
    {
        EPUBLoader.book.package.metadata.direction === "rtl" ? EPUBLoader.rendition.next() : EPUBLoader.rendition.prev();
    }

    static onKeyUp(e)
    {
        // Right Key
        if ((e.keyCode || e.which) == 39)
        {
            EPUBLoader.nextPage();
        }

        // Left Key
        if ((e.keyCode || e.which) == 37)
        {
            EPUBLoader.prevPage();
        }
    }

    static onScroll(e)
    {
        if (e.originalEvent.wheelDelta >= 0)
        {
            EPUBLoader.prevPage();
        }
        else
        {
            EPUBLoader.nextPage();
        }
    }
}

class PDFLoader
{
    static id;
    static iframe;
    static totalPageCount = -1;
    static pageOnLastUpdate = -1;
    static updatingDatabasePage = false;
    static currentPage = 1;
    static statusElement;


    static load(id)
    {
        viewerRootElement.html(`<iframe id="pdf-viewer" style="display: none;"></iframe>`);
        PDFLoader.id = id;
        PDFLoader.iframe = $("#pdf-viewer");
        PDFLoader.iframe.attr('src', "/packages/book-hub/pdfjs/iframe.html?file=" + encodeURIComponent("/packages/book-hub/api/download.php?id=" + id));
    }

    static setElements(elements)
    {
        $(elements["download"]).attr("href", "/packages/book-hub/api/download.php?id=" + id)
        $(elements["download-secondary"]).attr("href", "/packages/book-hub/api/download.php?id=" + id)
        $(elements["edit"]).attr("href", "/books/edit?id=" + id)
        $(elements["edit-secondary"]).attr("href", "/books/edit?id=" + id)

        PDFLoader.statusElement = $(elements["status"]);
        PDFLoader.setStatusOptions();
    }
    static done()
    {
        loaderElement.hide();
        PDFLoader.iframe.show();
        PDFLoader.iframe.focus();
        PDFLoader.jumpToStartPage();
    }

    static jumpToStartPage()
    {
        var data = {
            id: PDFLoader.id,
        }
        API.simple("book-hub", "view/pdf-page", data,
            function (result)
            {
                if (result["success"] == true)
                {
                    var page = parseInt(result["page"]);
                    PDFLoader.iframe.get(0).contentWindow.PDFViewerApplication.page = page;
                    PDFLoader.iframe.get(0).contentWindow.PDFViewerApplication.pdfViewer.currentScaleValue = "page-fit";
                    PDFLoader.iframe.get(0).contentWindow.PDFViewerApplication.pdfViewer.spreadMode = 0;

                    PDFLoader.pageOnLastUpdate = page;
                    PDFLoader.currentPage = page;
                    setTimeout(PDFLoader.setDatabasePage, 2000);
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

    static setDatabasePage()
    {
        setInterval(function ()
        {
            if (PDFLoader.currentPage != PDFLoader.pageOnLastUpdate && !PDFLoader.updatingDatabasePage)
            {
                PDFLoader.updatingDatabasePage = true;
                var number = PDFLoader.currentPage;
                var data = {
                    id: id,
                    page: number
                }
                API.simple("book-hub", "edit/pdf-page", data,
                    function (result)
                    {
                        if (result["success"] == true)
                        {
                            PDFLoader.pageOnLastUpdate = number;
                            PDFLoader.updatingDatabasePage = false;
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

    static setTotalPages(number)
    {
        PDFLoader.totalPageCount = number;
    }

    static onPageChange(number)
    {
        if (PDFLoader.totalPageCount == -1)
        {
            return;
        }
        PDFLoader.currentPage = number;

        if (PDFLoader.currentPage == PDFLoader.totalPageCount && PDFLoader.statusElement.val() != "finished")
        {
            PDFLoader.statusElement.val("finished");
            PDFLoader.onStatusChange();
        }

        if (PDFLoader.currentPage != 1 && PDFLoader.statusElement.val() == "unread")
        {
            PDFLoader.statusElement.val("reading");
            PDFLoader.onStatusChange();
        }
    }


    static setStatusOptions()
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
                    PDFLoader.statusElement.html(html);
                    PDFLoader.setStatusSelected();
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
    static setStatusSelected()
    {
        var data = {
            id: PDFLoader.id
        }
        API.simple("book-hub", "view/status", data,
            function (result)
            {
                if (result["success"] == true)
                {
                    var status = result["status"];
                    PDFLoader.statusElement.val(status);

                    PDFLoader.statusElement.on("change", function ()
                    {
                        PDFLoader.onStatusChange();
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
    static onStatusChange()
    {
        var data = {
            id: PDFLoader.id,
            status: PDFLoader.statusElement.val()
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
}
class PDFLoaderRelay
{
    setElements(elements)
    {
        PDFLoader.setElements(elements);
    }
    done()
    {
        PDFLoader.done();
    }
    setTotalPages(number)
    {
        PDFLoader.setTotalPages(number);
    }
    onPageChange(number)
    {
        PDFLoader.onPageChange(number);
    }
}
var pdfLoaderRelay = new PDFLoaderRelay();