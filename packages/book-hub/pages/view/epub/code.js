var id;
var readerRootElement;
var reader;
var book;
var rendition;
var displayed;

var resizeTimer;

$(document).ready(function ()
{
    documentReady();
});

function documentReady()
{
    id = getUrlParameter("id");
    readerRootElement = $("#reader-root");
    reader = $("#reader");

    Print.documentReady();
    Fullscreen.documentReady();
    Download.documentReady();
    Edit.documentReady();
    Navigation.documentReady();
    Status.documentReady();
    Searchbar.documentReady();
    Settings.documentReady();
    Chapters.documentReady();

    //load book
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `/packages/book-hub/api/download.php?id=${id}&format=epub`);
    xhr.responseType = "arraybuffer";
    xhr.onload = function ()
    {
        if (this.status === 200)
        {
            //load
            book = ePub(xhr.response);

            //book events
            book.ready.then(onBookLoaded);
            book.loaded.navigation.then(onBookNavigationLoaded);

            //render
            rendition = book.renderTo(reader.get(0), {
                manager: "continuous",
                flow: "paginated",
                method: "continuous",
                width: parseInt(reader.width()),
                height: parseInt(reader.height())
            });
            //settings
            rendition.settings.spread = "none";
            //theme
            rendition.themes.default(Settings.getCss());

            //display
            displayed = rendition.display();

            $(window).resize(onResize);
        }
        else
        {
            Alert.error("Unable to load book");
        }
    };
    xhr.send();
}

function onBookLoaded()
{
    $("#loader-root").remove();

    //rendition events
    rendition.on("rendered", onRenditionRendered);
    rendition.on('relocated', onRenditionRelocated);

    //keyup event
    document.addEventListener("keyup", onKeyUp, false);
    rendition.on("keyup", onKeyUp);

    //keydown event
    $(document).keydown(onKeyDown);

    //scroll event
    $(readerRootElement).bind('mousewheel', onScroll);

    Page.onBookLoaded();
    Settings.onBookLoaded();
}
function onRenditionRelocated(location)
{
    Page.onRenditionRelocated(location);
    Chapters.onRenditionRelocated(location);
    Searchbar.onRenditionRelocated(location);
}
function onRenditionRendered(e, i)
{
    //keyup event
    i.document.documentElement.addEventListener('keyup', onKeyUp, false);
    //scroll event
    $(i.document.documentElement).bind('mousewheel', onScroll);

    Searchbar.onRenditionRendered(i.document);
    Settings.onRenditionRendered(i.document);
}
function onBookNavigationLoaded(navigation)
{
    Chapters.onBookNavigationLoaded(navigation);
}
function onKeyUp(event)
{
    Navigation.onKeyUp(event);
    Searchbar.onKeyUp(event);
    Settings.onKeyUp(event);
}
function onKeyDown(event)
{
    Searchbar.onKeyDown(event);
}
function onScroll(event)
{
    Navigation.onScroll(event);
}
function onResize()
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

class Navigation
{
    static toolbarNextElement;
    static toolbarPrevElement;
    static pageArrowPrevElement;
    static pageArrowNextElement;

    static documentReady()
    {
        Navigation.toolbarNextElement = $("#toobar-next-page");
        Navigation.toolbarPrevElement = $("#toobar-prev-page");
        Navigation.pageArrowNextElement = $("#page-arrow-next");
        Navigation.pageArrowPrevElement = $("#page-arrow-prev");

        Navigation.toolbarNextElement.on("click", Navigation.next);
        Navigation.toolbarPrevElement.on("click", Navigation.prev);
        Navigation.pageArrowNextElement.on("click", Navigation.next);
        Navigation.pageArrowPrevElement.on("click", Navigation.prev);
    }

    static onKeyUp(event)
    {
        // Right Key
        if ((event.keyCode || event.which) == 39)
        {
            Navigation.next();
        }

        // Left Key
        if ((event.keyCode || event.which) == 37)
        {
            Navigation.prev();
        }
    }
    static onScroll(event)
    {
        if (event.originalEvent.wheelDelta >= 0)
        {
            Navigation.prev();
        }
        else
        {
            Navigation.next();
        }
    }

    static goTo(pageId)
    {
        rendition.display(pageId);
    }
    static next()
    {
        rendition.next();
    }
    static prev()
    {
        rendition.prev();
    }
}

class Print
{
    static button;

    static documentReady()
    {
        Print.button = $("#print");
        Print.button.on("click", Print.print);
    }

    static print()
    {
        $("iframe").get(0).contentWindow.focus();
        $("iframe").get(0).contentWindow.print();
    }
}

class Fullscreen
{
    static button;

    static documentReady()
    {
        Fullscreen.button = $("#fullscreen");
        Fullscreen.button.on("click", Fullscreen.fullscreen);
    }

    static fullscreen()
    {
        var readerDom = reader.get(0);
        if (readerDom.requestFullscreen)
        {
            readerDom.requestFullscreen();
        }
        else if (readerDom.webkitRequestFullscreen)
        { /* Safari */
            readerDom.webkitRequestFullscreen();
        }
        else if (readerDom.msRequestFullscreen)
        { /* IE11 */
            readerDom.msRequestFullscreen();
        }
    }
}

class Download
{
    static button;

    static documentReady()
    {
        Download.button = $("#download");
        Download.button.attr("href", `/packages/book-hub/api/download.php?id=${id}&format=epub`)
    }
}

class Edit
{
    static button;

    static documentReady()
    {
        Download.button = $("#edit");
        Download.button.attr("href", `/books/edit?id=${id}`)
    }
}

class Chapters
{
    static toggleElement;
    static sidebarElement;
    static ulElement;

    static documentReady()
    {
        Chapters.sidebarElement = $("#chapters-sidebar");
        Chapters.toggleElement = $("#toggle-sidebar");

        Chapters.toggleElement.on("click", Chapters.toggle);
        Chapters.ulElement = $("#chapters-list");
    }

    static open()
    {
        Chapters.sidebarElement.css("left", "0");
        Chapters.toggleElement.addClass("open");
        readerRootElement.css("padding-left", "250px");

    }

    static close()
    {
        Chapters.sidebarElement.css("left", "-250");
        Chapters.toggleElement.removeClass("open");
        readerRootElement.css("padding-left", "0px");
    }

    static toggle()
    {
        if (Chapters.sidebarElement.css("left") == "0px")
        {
            Chapters.close();
        }
        else
        {
            Chapters.open();
        }
    }

    static onBookNavigationLoaded(navigation)
    {
        var list = ``;

        navigation.toc.forEach(item =>
        {
            var subitems = "";
            item.subitems.forEach(subitem =>
            {
                subitems += `<li class="chapters-list-subitem" id="chapters-list-item-${Chapters.idSafe(subitem.id)}" onClick="Navigation.goTo('${subitem.href}')">${subitem.label.trim()}</li>`;
            })

            list += `<li class="chapters-list-item" id="chapters-list-item-${Chapters.idSafe(item.id)}" onClick="Navigation.goTo('${item.href}')">${item.label.trim()}${subitems}</li>`;
        });

        Chapters.ulElement.append(list);
    }
    static onRenditionRelocated(location)
    {
        var className = "chapters-list-item-active";
        var active = $("." + className);
        if (active)
        {
            active.removeClass(className);
        }
        $(`#chapters-list-item-${Chapters.idSafe(location.start.href)}`).addClass(className);
    }

    static idSafe(id)
    {
        return id.replace(/[^\w\s]/gi, '_')
    }
}

class Page
{
    static updateLastVisitedDBTimer;

    static goToLastVisitedDB()
    {
        var data = {
            id: id,
        }
        API.simple("book-hub", "view/epub-page", data,
            function (result)
            {
                if (result["success"] == true)
                {
                    Navigation.goTo(result["page"]);
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
    static updateLastVisitedDB(cfi)
    {
        clearTimeout(Page.updateLastVisitedDBTimer);
        Page.updateLastVisitedDBTimer = setTimeout(function ()
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

    static onBookLoaded()
    {
        Page.goToLastVisitedDB();
    }
    static onRenditionRelocated(location)
    {
        Page.updateLastVisitedDB(location.start.cfi);
    }
}

class Settings
{
    static mainElement;
    static toggleElement;
    static pageArrowPrevElement;
    static pageArrowNextElement;

    static fontElement;
    static fontSizeElement;
    static lineHeightElement;
    static alignElement;
    static widthElement;
    static nightModeElement;
    static showArrowsElement;

    static documentReady()
    {
        Settings.toggleElement = $("#toggle-settings");
        Settings.mainElement = $("#settings");
        Settings.pageArrowPrevElement = $("#page-arrow-prev");
        Settings.pageArrowNextElement = $("#page-arrow-next");

        Settings.widthElement = $("#settings-width-input");
        Settings.fontElement = $("#settings-font-input");
        Settings.fontSizeElement = $("#settings-font-size-input");
        Settings.lineHeightElement = $("#settings-line-height-input");
        Settings.alignElement = $("#settings-align-input");
        Settings.nightModeElement = $("#settings-night-mode-input");
        Settings.showArrowsElement = $("#settings-show-arrows-input");

        Settings.toggleElement.on("click", Settings.toggle);

        Settings.widthElement.on("change", Settings.updateLayout);
        Settings.showArrowsElement.on("change", Settings.updateLayout);
        Settings.fontElement.on("change", Settings.updateCss);
        Settings.fontSizeElement.on("change", Settings.updateCss);
        Settings.lineHeightElement.on("change", Settings.updateCss);
        Settings.alignElement.on("change", Settings.updateCss);
        Settings.nightModeElement.on("change", Settings.updateCss);

        Settings.loadSettings();
        Settings.updateLayout();
    }

    static onBookLoaded()
    {
        Settings.updateCss();
    }
    static onRenditionRendered(document)
    {
        if (document != "undefined")
        {
            $(document).find("head").append(`
            <style>
            @font-face {
                font-family: 'OpenDyslexic-Regular';
                src: url('https://books.levimoore.dk/packages/book-hub/fonts/OpenDyslexic-Regular.otf');
            }
            @font-face {
                font-family: 'OpenDyslexic-Bold';
                src: url('https://books.levimoore.dk/packages/book-hub/fonts/OpenDyslexic-Bold.otf');
            }
            @font-face {
                font-family: 'OpenDyslexic-Italic';
                src: url('https://books.levimoore.dk/packages/book-hub/fonts/OpenDyslexic-Italic.otf');
            }
            @font-face {
                font-family: 'Atkinson-Hyperlegible-Regular';
                src: url('https://books.levimoore.dk/packages/book-hub/fonts/Atkinson-Hyperlegible-Regular.otf');
            }
            </style>`);
        }
    }

    static open()
    {
        Settings.mainElement.show();
    }
    static close()
    {
        Settings.mainElement.hide();
    }
    static toggle()
    {
        if (Settings.isOpen())
        {
            Settings.close();
        }
        else
        {
            Settings.open();
        }
    }
    static isOpen()
    {
        return Settings.mainElement.css("display") != "none";
    }

    static loadSettings()
    {
        Settings.widthElement.val(Settings.getCookie("width", 820));
        Settings.fontElement.val(Settings.getCookie("font", "Calibri"));
        Settings.fontSizeElement.val(Settings.getCookie("font-size", 19));
        Settings.lineHeightElement.val(Settings.getCookie("line-height", 21));
        Settings.alignElement.val(Settings.getCookie("align", "justify"));

        if (Settings.getCookie("night-mode", 0) == 1)
        {
            Settings.nightModeElement.prop('checked', true);
        }
        if (Settings.getCookie("show-arrows", 1) == 1)
        {
            Settings.showArrowsElement.prop('checked', true);
        }
    }

    static updateCss()
    {
        var backgroundColor = "white";
        if (Settings.nightModeElement.is(':checked'))
        {
            backgroundColor = "#1d1d1d";
        }
        reader.css('background-color', backgroundColor);

        rendition.themes.register("settings", Settings.getCss());
        rendition.themes.select("settings");
    }

    static getCss()
    {
        //font size
        var font = Settings.fontElement.val();
        Settings.setCookie("font", font);

        //font size
        var fontSize = Settings.fontSizeElement.val();
        fontSize = Math.min(fontSize, 100);
        fontSize = Math.max(fontSize, 1);
        Settings.fontSizeElement.val(fontSize);
        Settings.setCookie("font-size", fontSize);

        //line height
        var lineHeight = Settings.lineHeightElement.val();
        lineHeight = Math.min(lineHeight, 100);
        lineHeight = Math.max(lineHeight, 1);
        Settings.lineHeightElement.val(lineHeight);
        Settings.setCookie("line-height", lineHeight);

        //align
        var align = Settings.alignElement.val();
        Settings.setCookie("align", align);

        //background color
        var backgroundColor = "white";
        var fontColor = "black";
        if (Settings.nightModeElement.is(':checked'))
        {
            backgroundColor = "#1d1d1d";
            fontColor = "#cecece";
        }
        Settings.setCookie("night-mode", Settings.nightModeElement.is(':checked') ? 1 : 0);

        return {
            "p": {
                "font-size": `${fontSize}px !important`,
                "line-height": `${lineHeight}px !important;`,
                "color": `inherit !important;`,
                "font-family": `inherit !important;`
            },
            "body": {
                "font-family": `${font} !important`,
                "background-color": `${backgroundColor} !important`,
                "color": `${fontColor} !important;`,
                "text-align": `${align} !important;`
            }
        };
    }

    static updateLayout()
    {
        //width
        var width = Settings.widthElement.val();
        width = Math.min(width, 5000);
        width = Math.max(width, 100);
        Settings.widthElement.val(width);

        reader.css("max-width", `${width}px`);
        if (rendition != undefined)
        {
            rendition.resize(
                parseInt(reader.width()),
                parseInt(reader.height())
            );
        }

        Settings.setCookie("width", width)

        //arrows
        if (Settings.showArrowsElement.is(':checked'))
        {
            Settings.pageArrowNextElement.show();
            Settings.pageArrowPrevElement.show();
        }
        else
        {
            Settings.pageArrowNextElement.hide();
            Settings.pageArrowPrevElement.hide();
        }
        Settings.setCookie("show-arrows", Settings.showArrowsElement.is(':checked') ? 1 : 0);
    }

    static onKeyUp(event)
    {
        if (event.keyCode == 27)
        {
            if (Settings.isOpen())
            {
                Settings.close();
            }
        }
    }

    static setCookie(name, value)
    {
        var d = new Date();
        d.setTime(d.getTime() + (999 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "-epub-reader-settings=" + value + ";" + expires + ";path=/";
    }
    static getCookie(name, defaultValue)
    {
        var name = name + "-epub-reader-settings=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++)
        {
            var c = ca[i];
            while (c.charAt(0) == ' ')
            {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0)
            {
                return c.substring(name.length, c.length);
            }
        }
        return defaultValue;
    }
}

class Status
{
    static selectElement;

    static documentReady()
    {
        Status.selectElement = $("#status");
        Status.setOptions();
    }

    static setOptions()
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
                        html += `<option value="${option}">${Status.toTitleCase(option)}</option>`;
                    });
                    Status.selectElement.html(html);
                    Status.setSelected();
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
    static setSelected()
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
                    Status.selectElement.val(status);

                    Status.selectElement.on("change", function ()
                    {
                        Status.onChange();
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
    static onChange()
    {
        var data = {
            id: id,
            status: Status.selectElement.val()
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

    static toTitleCase(str)
    {
        return str.replace(
            /\w\S*/g,
            function (txt)
            {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }
}

class Searchbar
{
    static toggleElement;
    static inputElement;
    static searchbarElement;
    static countElement;
    static nextElement;
    static preElement;

    static resultsIndex = 0;
    static results = [];

    static documentReady()
    {
        Searchbar.searchbarElement = $("#searchbar");
        Searchbar.toggleElement = $("#toggle-searchbar");
        Searchbar.inputElement = $("#searchbar-input");
        Searchbar.countElement = $("#searchbar-count");
        Searchbar.nextElement = $("#searchbar-next");
        Searchbar.preElement = $("#searchbar-pre");

        Searchbar.toggleElement.on("click", Searchbar.toggle);
        Searchbar.nextElement.on("click", Searchbar.next);
        Searchbar.preElement.on("click", Searchbar.pre);
        Searchbar.inputElement.keyup(function (e)
        {
            if (e.keyCode == 13)
            {
                e.preventDefault();
                Searchbar.onEnterKeyDown();
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

    static onKeyDown(event)
    {
        if (event.keyCode == 114 || event.keyCode == 70 || event.keyCode == 27)
        {
            event.preventDefault();
        }
    }
    static onKeyUp(event)
    {
        if (event.keyCode == 114 || event.keyCode == 70)
        {
            Searchbar.onCtrlFKeyDown();
        }
        if (event.keyCode == 27)
        {
            Searchbar.onEscapeKeyDown();
        }
    }

    static onRenditionRendered(document)
    {
        if (document != "undefined")
        {
            $(document).find("body").append(`
            <script>
                document.addEventListener("keydown", keydown, false);
                function keydown(e)
                {
                    if (e.keyCode == 114 || e.keyCode == 70 || e.keyCode == 27)
                    {
                        e.preventDefault();
                    }
                }
            </script>`);
        }
    }
    static onRenditionRelocated(location)
    {
        rendition.annotations.removeAll();

        Searchbar.results.forEach(element =>
        {
            if (element.cfi == Searchbar.results[Searchbar.resultsIndex].cfi)
            {
                rendition.annotations.add("highlight", Searchbar.results[Searchbar.resultsIndex].cfi, {}, (e) => { }, "hl", { "fill": "red", "fill-opacity": "0.3", "mix-blend-mode": "multiply" })
            }
            else
            {
                rendition.annotations.highlight(element.cfi);
            }
        });
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
        Searchbar.resultsIndex = 0;
        Searchbar.results = [];
        for (let i = 0; i < book.spine.spineItems.length; i++)
        {
            const item = book.spine.spineItems[i];
            await item.load(book.load.bind(book));
            var result = item.find(query);
            result.forEach(element =>
            {
                Searchbar.results.push(element);
                rendition.annotations.highlight(element.cfi);
            });
        }

        Searchbar.goTo(0);
    }

    static next()
    {
        if (Searchbar.resultsIndex < Searchbar.results.length - 1)
        {
            Searchbar.goTo(Searchbar.resultsIndex + 1);
        }
        else
        {
            Searchbar.goTo(0);
        }
    }
    static pre()
    {
        if (Searchbar.resultsIndex > 0)
        {
            Searchbar.goTo(Searchbar.resultsIndex - 1);
        }
        else
        {
            Searchbar.goTo(Searchbar.results.length - 1);
        }
    }

    static goTo(index)
    {
        Searchbar.resultsIndex = index;
        Searchbar.countElement.html((index + 1) + "/" + Searchbar.results.length);

        Navigation.goTo(Searchbar.results[index].cfi);
    }

    static clear()
    {
        rendition.annotations.removeAll();
        Searchbar.results = [];
        Searchbar.resultsIndex = 0;
    }
}