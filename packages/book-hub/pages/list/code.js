var books = [];

$(document).ready(function()
{
    $("#sort-by").on("change", updateUI);
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
    var searchQuery = $("#search-query").val();
    var sortBy = $("#sort-by").val();
    books.sort(
        function(a, b)
        {
            if (sortBy == "title-asc")
            {
                if (a["title"].toLowerCase() < b["title"].toLowerCase()) return -1;
                if (a["title"].toLowerCase() > b["title"].toLowerCase()) return 1;
            }
            if (sortBy == "title-desc")
            {
                if (a["title"].toLowerCase() > b["title"].toLowerCase()) return -1;
                if (a["title"].toLowerCase() < b["title"].toLowerCase()) return 1;
            }
            return 0;
        }
    );

    var root = $("#books");
    root.html("");
    books.forEach(book =>
    {
        console.log(searchQuery);
        if (!(searchQuery === null || searchQuery.match(/^ *$/) !== null))
        {
            if (!book["title"].toLowerCase().includes(searchQuery.toLowerCase()))
            {
                return;
            }
        }

        var viewUrl = `/books/view?id=${book["id"]}`;
        var cover = `<img src="${book["cover"]}">`;
        var title = `<p class="title">${book["title"]}</p>`;
        var subtitle = book["subtitle"] != null ? `<p class="subtitle">${book["subtitle"]}</p>` : "";

        root.append(`
        <div class="book col-md-auto">
            <a href="${viewUrl}">
            ${cover}
            ${title}
            ${subtitle}
            </a>
        </div>`);
    });
}