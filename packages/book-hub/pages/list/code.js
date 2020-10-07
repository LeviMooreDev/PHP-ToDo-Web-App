var books = [];

$(document).ready(function()
{
    Layout.ready();
    Sorting.ready();
    Filter.ready();
    CoverLayout.ready();
    TableLayout.ready();
    
    Alert.working(() =>
    {
        API.simple("book-hub", "view/all-books", "",
            function(result)
            {
                books = result["books"];
                Sorting.sort();
                Layout.refresh();
                Alert.workingDone();
            },
            function(result)
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
                console.log(result);
            }
        );
    });
});

class Layout
{
    static layoutElement = $("#layout");

    static ready()
    {
        Layout.layoutElement.on("change", Layout.onLayoutChange);
        Layout.layoutElement.val(Cookie.get("layout", "covers"));
    }

    static refresh()
    {
        var layout = Layout.layoutElement.val();
        if (layout == "table")
        {
            TableLayout.refresh();
        }
        else
        {
            CoverLayout.refresh();
        }
    }

    static onLayoutChange()
    {
        var value = Layout.layoutElement.val();
        Cookie.set("layout", value);
        Layout.refresh();
    }
}

class CoverLayout
{
    static ready()
    {

    }

    static refresh()
    {
        $("#root").html(`<div id="books" class="row justify-content-center"></div>`);

        var container = $("#books");
        books.forEach(book =>
        {
            if (Filter.pass(book))
            {
                var viewUrl = `/books/view?id=${book["id"]}`;
                var coverColor = `${book["cover-color"]}`;
                var cover = `<img src="${book["cover"]}" style="background-color: #${coverColor};">`;
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
            }
        });
    }
}

class TableLayout
{
    static showColumns;
    static columns = [
    {
        header: "Title",
        display: TableLayout.displayTitle,
        headerClick: TableLayout.headerClickSort(0),
        hidable: false,
        fit: false
    },
    {
        header: "Authors",
        display: function(book)
        {
            return book["authors"];
        },
        headerClick: TableLayout.headerClickSort(1),
        hidable: true,
        fit: true
    },
    {
        header: "Categories",
        display: function(book)
        {
            return book["categories"];
        },
        headerClick: TableLayout.headerClickSort(2),
        hidable: true,
        fit: true
    },
    {
        header: "Release date",
        display: function(book)
        {
            return book["date"];
        },
        headerClick: TableLayout.headerClickSort(3),
        hidable: true,
        fit: true
    },
    {
        header: "ISBN10",
        display: function(book)
        {
            return book["isbn10"];
        },
        headerClick: TableLayout.headerClickSort(4),
        hidable: true,
        fit: true
    },
    {
        header: "ISBN13",
        display: function(book)
        {
            return book["isbn13"];
        },
        headerClick: TableLayout.headerClickSort(5),
        hidable: true,
        fit: true
    },
    {
        header: "Status",
        display: function(book)
        {
            return book["status"];
        },
        headerClick: TableLayout.headerClickSort(6),
        hidable: true,
        fit: true
    },
    {
        header: "Added",
        display: function(book)
        {
            return book["added"];
        },
        headerClick: TableLayout.headerClickSort(7),
        hidable: true,
        fit: true
    },
    {
        header: "Actions",
        display: TableLayout.displayActions,
        headerClick: "",
        hidable: false,
        fit: true
    }]

    static ready()
    {
        TableLayout.showColumns = Cookie.get("table-show", null);
        if (TableLayout.showColumns == null)
        {
            TableLayout.showColumns = ["Title", "Authors", "Categories", "Release date"];
        }
        else
        {
            TableLayout.showColumns = JSON.parse(TableLayout.showColumns);
        }
    }

    static refresh()
    {
        var showOptions = "";
        var headers = "";
        TableLayout.columns.forEach(column =>
        {
            if (column.hidable)
            {
                showOptions += `<option>${column.header}</option>`;
            }
            else
            {
                showOptions += `<option disabled>${column.header}</option>`;
            }

            if (!column.hidable || TableLayout.showColumns.includes(column.header))
            {
                headers += `<th class="cursor-pointer ${column.fit ? 'fit' : ''}" onclick="${column.headerClick}">${column.header}</th>`;
            }
        });

        var root = $("#root");
        root.html("");
        root.append(`
            <div class="card">
                <div>
                    <select id="table-show" class="selectpicker float-right" multiple data-selected-text-format="static" title="Show" data-width="300px">
                        ${showOptions}
                    </select>
                </div>
                <div class="card-body">
                    <table id="books-table" class="table table-striped w-100 table-hover">
                        <thead>
                            <tr>
                                ${headers}
                            </tr>
                        </thead>
                            <tbody id="books-table-body">
                        </tbody>
                    </table>
                </div>
            </div>`);

        $('#table-show').selectpicker();
        $('#table-show').selectpicker('val', TableLayout.showColumns);
        $('#table-show').on('hidden.bs.select', function(e, clickedIndex, isSelected, previousValue)
        {
            TableLayout.onShowSelectChange();
        });
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
        {
            $('#table-show').selectpicker('mobile');
        }

        var body = $("#books-table-body");
        books.forEach(book =>
        {
            if (Filter.pass(book) == true)
            {
                var tds = "";
                TableLayout.columns.forEach(column =>
                {
                    if (!column.hidable || TableLayout.showColumns.includes(column.header))
                    {
                        tds += `<td class="${column.fit ? 'fit' : ''}">${column.display(book, column)}</td>`;
                    }
                });
                body.append(`<tr>${tds}</tr>`);
            }
        });
    }

    static displayTitle(book)
    {
        return book["title"] + (book["subtitle"] != null ? " - <i>" + book["subtitle"] + "</i>" : "");
    }
    static displayActions(book)
    {
        return `
            <a class="btn btn-primary" data-toggle="tooltip" title="Read" href="/books/view?id=${book["id"]}">
                <i class="fas fa-eye"></i>
            </a>
            <a class="btn btn-primary" data-toggle="tooltip" title="Edit" href="/books/edit?id=${book["id"]}">
                <i class="fas fa-edit"></i>
            </a>
            <a class="btn btn-primary" data-toggle="tooltip" title="Download" href="/packages/book-hub/api/download.php?id=${book["id"]}" target="_blank">
                <i class="fas fa-download"></i>
            </a>`;
    }

    static headerClickSort(index)
    {
        return `TableLayout.headerSortClick('${index}-asc', '${index}-desc')`;
    }

    static headerSortClick(a, b)
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
        $("#sort-by").trigger("change");
    }

    static onShowSelectChange()
    {
        TableLayout.showColumns = $('#table-show').selectpicker('val');
        Cookie.set("table-show", JSON.stringify(TableLayout.showColumns));
        TableLayout.refresh();
    }
}

class Filter
{
    static searchable = [
        "title",
        "subtitle",
        "authors",
        "categories",
        "added",
        "date",
        "isbn10",
        "isbn13",
        "publisher",
        "status"
    ]

    static ready()
    {
        $("#status").val(Cookie.get("status", "all"));
        $("#status").on("change", Filter.onStatusChange);
        $('#search-query').keyup(function(e)
        {
            Layout.refresh();
        });

        $('#search-query').tooltip();
        $('#search-query').on('focus', '[data-toggle=tooltip]', function()
        {
            $(this).tooltip('hide');
        });

        // $('#search-query').keyup(function(e)
        // {
        //     if (e.keyCode == 13)
        //     {
        //         Layout.refresh();
        //     }
        // });
    }

    static pass(book)
    {
        if (Filter.passSearch(book) == false)
        {
            return false;
        }
        if (Filter.passStatus(book) == false)
        {
            return false;
        }

        return true;
    }

    static passSearch(book)
    {
        var searchable = "";
        Filter.searchable.forEach(search =>
        {
            if (book[search] != null)
            {
                searchable += book[search].toLowerCase() + " ";
            }
        });

        var match = true;

        var blocks = $("#search-query").val();
        if (!(blocks === null || blocks.match(/^ *$/) !== null))
        {
            blocks = blocks.toLowerCase();

            match = false;
            blocks.split(",").forEach(block =>
            {
                var foundAll = true;
                block.split(".").forEach(needs =>
                {
                    needs = needs.trim();

                    if (!searchable.includes(needs))
                    {
                        foundAll = false;
                    }
                });

                if (foundAll)
                {
                    match = true;
                }
            });
        }

        return match;
    }

    static passStatus(book)
    {
        var show = $("#status").val();
        if (show == "all")
        {
            return true;
        }
        return book["status"] == show;
    }

    static onStatusChange()
    {
        var value = $("#status").val();
        Cookie.set("status", value);
        Layout.refresh();
    }
}

class Sorting
{
    static selectElement = $("#sort-by");

    static sortingOptions = [
    {
        title: "Title",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["title"], b["title"])
        }
    },
    {
        title: "Authors",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["authors"], b["authors"])
        }
    },
    {
        title: "Categories",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["categories"], b["categories"])
        }
    },
    {
        title: "Release date",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["date"], b["date"])
        }
    },
    {
        title: "Publisher",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["publisher"], b["publisher"])
        }
    },
    {
        title: "ISBN10",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["isbn10"], b["isbn10"])
        }
    },
    {
        title: "ISBN13",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["categories"], b["categories"])
        }
    },
    {
        title: "Status",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["status"], b["status"])
        }
    },
    {
        title: "Added",
        sorting: function(a, b)
        {
            return Sorting.stringSorting(a["added"], b["added"])
        }
    },
    {
        title: "Cover color",
        sorting: function(a, b)
        {
            return Sorting.colorHSorting(a["cover-color"], b["cover-color"])
        }
    },
    {
        title: "Cover brightness",
        sorting: function(a, b)
        {
            return Sorting.colorLSorting(a["cover-color"], b["cover-color"])
        }
    }, ]

    static ready()
    {
        Sorting.selectElement.on("change", Sorting.onSortByChange);

        var options = "";
        var index = 0;
        Sorting.sortingOptions.forEach(option =>
        {
            if (index != 0)
            {
                options += `<option disabled>──────────</option>`;
            }
            options += `<option value="${index}-asc">${option.title} ASC</option>`;
            options += `<option value="${index}-desc">${option.title} DESC</option>`;
            index++;
        });
        Sorting.selectElement.html(options);

        try
        {
            Sorting.selectElement.val(JSON.parse(Cookie.get("sort-by", "[\"0-asc\"]")));
        }
        catch (error)
        {}
    }

    static sort()
    {
        books.sort(
            Sorting.sortingOptions[Sorting.selectElement.val().split("-")[0]].sorting
        );
        if (Sorting.selectElement.val().split("-")[1] != "asc")
        {
            books.reverse();
        }
    }

    static onSortByChange()
    {
        Cookie.set("sort-by", JSON.stringify(Sorting.selectElement.val()));
        Sorting.sort();
        Layout.refresh();
    }

    static stringSorting(a, b)
    {
        if (a == null) return 1;
        if (b == null) return -1;
        if (a.toLowerCase() > b.toLowerCase()) return 1;
        if (a.toLowerCase() < b.toLowerCase()) return -1;
        return 0;
    };

    static colorHSorting(a, b)
    {
        a = Sorting.hexToHSL(a);
        b = Sorting.hexToHSL(b);

        if (a['h'] < b['h'])
            return -1;
        if (a['h'] > b['h'])
            return 1;

        return 0;
    };

    static colorLSorting(a, b)
    {
        a = Sorting.hexToHSL(a);
        b = Sorting.hexToHSL(b);

        if (a['l'] < b['l'])
            return 1;
        if (a['l'] > b['l'])
            return -1;

        return 0;
    };

    static hexToHSL(hex)
    {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var r = parseInt(result[1], 16) / 255;
        var g = parseInt(result[2], 16) / 255;
        var b = parseInt(result[3], 16) / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min)
        {
            h = s = 0;
        }
        else
        {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max)
            {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        var hsl = [];
        hsl['h'] = h;
        hsl['s'] = s;
        hsl['l'] = l;
        return hsl;
    }
}

class Cookie
{
    static set(name, value)
    {
        var d = new Date();
        d.setTime(d.getTime() + (999 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    static get(name, defaultValue)
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
}