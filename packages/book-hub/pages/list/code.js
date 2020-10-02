var books = [];

$(document).ready(function()
{
    $("#sort-by").on("change", sortByChange);
    $("#layout").on("change", layoutChange);
    $("#search-button").on("click", updateUI);
    $('#search-query').keyup(function(e)
    {
        if (e.keyCode == 13)
        {
            updateUI();
        }
    });
    ready();
});

function ready()
{
    $("#sort-by").val(getCookie("sort-by", "title-asc"));
    $("#layout").val(getCookie("layout", "covers"));
    load();
}

function load()
{
    Alert.working(() =>
    {
        API.simple("book-hub", "list/all", "",
            function(result)
            {
                books = result["books"];
                updateUI();
                Alert.workingDone();
            },
            function(result)
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
                console.log(result);
            }
        );
    });
}

function updateUI()
{
    var sortBy = $("#sort-by").val();
    var col = sortBy.split("-")[0];
    var asc = sortBy.split("-")[1] == "asc";

    books.sort(
        function(a, b)
        {

            if (a[col].toLowerCase() > b[col].toLowerCase()) return asc ? 1 : -1;
            if (a[col].toLowerCase() < b[col].toLowerCase()) return asc ? -1 : 1;
            return 0;
        }
    );

    var layout = $("#layout").val();
    if (layout == "table")
    {
        tableLayout();
    }
    else
    {
        coverLayout();
    }
}

function tableLayout()
{
    var root = $("#root");
    root.html("");
    root.append(`
        <div class="card">
            <div class="card-body">
                <table id="books-table" class="table table-striped w-100 table-hover">
                    <thead>
                        <tr>
                            <th onclick="tableClickHeader('title-asc','title-desc')">Title</th>
                            <th onclick="tableClickHeader('authors-asc','authors-desc')"class="fit">Authors</th>
                            <th onclick="tableClickHeader('categories-asc','categories-desc')"class="fit">Categories</th>
                            <th onclick="tableClickHeader('date-asc','date-desc')"class="fit">Release date</th>
                        </tr>
                    </thead>
                        <tbody id="books-table-body">
                    </tbody>
                </table>
            </div>
        </div>
    `);

    var body = $("#books-table-body");
    books.forEach(book =>
    {
        if (searchMatch(book) == false)
        {
            return;
        }

        var viewUrl = `/books/view?id=${book["id"]}`;
        var title = book["title"];
        var subtitle = book["subtitle"] != null ? ` - ${book["subtitle"]}` : "";
        var authors = book["authors"] == null ? "N/A" : book["authors"];
        var categories = book["categories"] == null ? "N/A" : book["categories"];
        var date = book["date"] == null ? "N/A" : book["date"];
        body.append(`
            <tr onclick="window.location='${viewUrl}';">
                <td>${title + subtitle}</td>
                <td class="fit">${authors}</td>
                <td class="fit">${categories}</td>
                <td class="fit">${date}</td>
            </tr>
        `);
    });
}

function coverLayout()
{
    var root = $("#root");
    root.html("");
    root.append(`
        <div id="books" class="row justify-content-center">

        </div>
    `);

    var container = $("#books");
    books.forEach(book =>
    {
        if (!searchMatch(book))
        {
            return;
        }

        var viewUrl = `/books/view?id=${book["id"]}`;
        var cover = `<img src="${book["cover"]}">`;
        var title = `<p class="title">${book["title"]}</p>`;
        var subtitle = book["subtitle"] != null ? `<p class="subtitle">${book["subtitle"]}</p>` : "";

        container.append(`
            <div class="book col-md-auto">
                <a href="${viewUrl}">
                ${cover}
                ${title}
                ${subtitle}
                </a>
            </div>`);
    });
}

function searchMatch(book)
{
    var cols = ["title", "authors", "categories", "date"];

    var searchQuery = $("#search-query").val();
    if (!(searchQuery === null || searchQuery.match(/^ *$/) !== null))
    {
        var match = false; 
        cols.forEach(col => {
            if (book[col].toLowerCase().includes(searchQuery.toLowerCase()))
            {
                match = true;
            }
        });
        return match;
    }
    return true;
}

function sortByChange()
{
    var value = $("#sort-by").val();
    setCookie("sort-by", value);
    updateUI();
}

function layoutChange()
{
    var value = $("#layout").val();
    setCookie("layout", value);
    updateUI();
}

function tableClickHeader(a, b)
{
    var sortBy = $("#sort-by").val();
    if (sortBy == a)
    {
        $("#sort-by").val(b);
    }
    else
    {
        $("#sort-by").val(a);
    }
    sortByChange();
}

function setCookie(name, value)
{
    var d = new Date();
    d.setTime(d.getTime() + (999 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name, defaultValue)
{
    var name = name + "=";
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