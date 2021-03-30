var books = [];

$(document).ready(function ()
{
    Layout.ready();
    Sorting.ready();
    Filter.ready();
    CoverLayout.ready();
    TableLayout.ready();

    Alert.workingSmall();
    API.simple("book-hub", "view/all-books", "",
        function (result)
        {
            books = result["books"];
            Filter.setupAutocomplete();
            Sorting.sort();
            Layout.refresh(false);
        },
        function (result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );

});

class Layout
{
    static cookieName = "layout";
    static default = "covers";
    static layoutElement = $("#layout");

    static ready()
    {
        Layout.layoutElement.on("change", Layout.onLayoutChange);
        Layout.layoutElement.val(Cookie.get(Layout.cookieName, Layout.default));
    }

    static refresh(showWorking = true)
    {
        if (showWorking)
        {
            Alert.workingSmall();
        }
        setTimeout(() =>
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
            Alert.workingDone();
        }, 200)
    }

    static onLayoutChange()
    {
        var value = Layout.layoutElement.val();
        Cookie.set(Layout.cookieName, value);
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
                var cover = `<img loading="lazy" height="375px" src="${book["cover-" + coverQuality]}" class="lazy" style="background-color: #${coverColor};">`;
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
    static selectElement = $("#sort-by");

    static showColumns;
    static showColumnsElementId = "table-show-columns";
    static showColumnsCookieName = "table-layout-able-show-columns";
    static showColumnsDefault = ["Title", "Authors", "Categories", "Release date"];

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
            display: function (book)
            {
                return book["authors"];
            },
            headerClick: TableLayout.headerClickSort(1),
            hidable: true,
            fit: false
        },
        {
            header: "Categories",
            display: function (book)
            {
                return book["categories"];
            },
            headerClick: TableLayout.headerClickSort(2),
            hidable: true,
            fit: false
        },
        {
            header: "Publishers",
            display: function (book)
            {
                return book["publishers"];
            },
            headerClick: TableLayout.headerClickSort(3),
            hidable: true,
            fit: true
        },
        {
            header: "Release date",
            display: function (book)
            {
                return book["date"];
            },
            headerClick: TableLayout.headerClickSort(4),
            hidable: true,
            fit: true
        },
        {
            header: "ISBN10",
            display: function (book)
            {
                return book["isbn10"];
            },
            headerClick: TableLayout.headerClickSort(5),
            hidable: true,
            fit: true
        },
        {
            header: "ISBN13",
            display: function (book)
            {
                return book["isbn13"];
            },
            headerClick: TableLayout.headerClickSort(6),
            hidable: true,
            fit: true
        },
        {
            header: "Status",
            display: function (book)
            {
                return book["status"];
            },
            headerClick: TableLayout.headerClickSort(7),
            hidable: true,
            fit: true
        },
        {
            header: "Pages",
            display: function (book)
            {
                return book["pages"];
            },
            headerClick: TableLayout.headerClickSort(8),
            hidable: true,
            fit: true
        },
        {
            header: "Added",
            display: function (book)
            {
                return book["added"];
            },
            headerClick: TableLayout.headerClickSort(9),
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
        TableLayout.showColumns = Cookie.get(TableLayout.showColumnsCookieName, null);
        if (TableLayout.showColumns == null)
        {
            TableLayout.showColumns = TableLayout.showColumnsDefault;
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
                    <select id="${TableLayout.showColumnsElementId}" class="selectpicker float-right" multiple data-selected-text-format="static" title="Show" data-width="300px">
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

        $(`#${TableLayout.showColumnsElementId}`).selectpicker();
        $(`#${TableLayout.showColumnsElementId}`).selectpicker('val', TableLayout.showColumns);
        $(`#${TableLayout.showColumnsElementId}`).on('hidden.bs.select', function (e, clickedIndex, isSelected, previousValue)
        {
            TableLayout.onShowSelectChange();
        });
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
        {
            $(`#${TableLayout.showColumnsElementId}`).selectpicker('mobile');
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
        var sortBy = TableLayout.selectElement.val();
        if (sortBy == a)
        {
            TableLayout.selectElement.val(b);
        }
        else
        {
            TableLayout.selectElement.val(a);
        }
        TableLayout.selectElement.trigger("change");
    }

    static onShowSelectChange()
    {
        if (JSON.stringify(TableLayout.showColumns) != JSON.stringify($(`#${TableLayout.showColumnsElementId}`).selectpicker('val')))
        {
            TableLayout.showColumns = $(`#${TableLayout.showColumnsElementId}`).selectpicker('val');
            Cookie.set(TableLayout.showColumnsCookieName, JSON.stringify(TableLayout.showColumns));
            Layout.refresh();
        }
    }
}

class Filter
{
    static statusSelectElement = $("#status");
    static statusCookieName = "filter-status";
    static statusDefault = "all";

    static searchQueryElement = $("#search-query");
    static searchQueryTimer = 0;

    static searchIncludeElement = $("#search-include");
    static searchIncludeCookieName = "filter-search-include";
    static searchIncludeDefault = ["Title", "Authors", "Categories"];
    static searchInclude;

    static searchable = [
        {
            title: "Title",
            index: "title"
        },
        {
            title: "Subtitle",
            index: "subtitle"
        },
        {
            title: "Authors",
            index: "authors"
        },
        {
            title: "Categories",
            index: "categories"
        },
        {
            title: "Publishers",
            index: "publishers"
        },
        {
            title: "Status",
            index: "status"
        },
        {
            title: "Release Date",
            index: "date"
        },
        {
            title: "ISBN10",
            index: "isbn10"
        },
        {
            title: "ISBN13",
            index: "isbn13"
        },
        {
            title: "Added",
            index: "added"
        }]

    static ready()
    {
        //search query
        Filter.searchQueryElement.keyup(function (e)
        {
            if (e.keyCode == 13)
            {
                Layout.refresh();
            }
        });
        Filter.searchQueryElement.tooltip();
        Filter.searchQueryElement.on('focus', function ()
        {
            Filter.searchQueryElement.tooltip('hide');
        });

        Filter.setupSearchInclude();

        //status
        Filter.setStatusOptions();
    }

    static setupAutocomplete()
    {
        let values = [];
        books.forEach(function (book)
        {
            if(book["authors"]){
                values.push(...book["authors"].split(","));
            }
            if(book["categories"]){
                values.push(...book["categories"].split(","));
            }
            if(book["title"]){
                values.push(book["title"]);
            }
        })
        values = [...new Set(values)].map(function(x){ return x.toLocaleLowerCase(); })
        values.push(...["AND", "OR", "NOT"]);
        $("#search-query").asuggest(values);
    }

    static setupSearchInclude()
    {
        Filter.searchInclude = Cookie.get(Filter.searchIncludeCookieName, null);
        if (Filter.searchInclude == null)
        {
            Filter.searchInclude = Filter.searchIncludeDefault;
        }
        else
        {
            Filter.searchInclude = JSON.parse(Filter.searchInclude);
        }

        var includeOptions = "";
        Filter.searchable.forEach(search =>
        {
            includeOptions += `<option>${search.title}</option>`;
        });
        Filter.searchIncludeElement.html(includeOptions);
        Filter.searchIncludeElement.selectpicker();
        Filter.searchIncludeElement.selectpicker('val', Filter.searchInclude);
        Filter.searchIncludeElement.on('hidden.bs.select', function (e, clickedIndex, isSelected, previousValue)
        {
            Filter.onSearchIncludeSelectChange();
        });
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
        {
            Filter.searchIncludeElement.selectpicker('mobile');
        }
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
            if (Filter.searchInclude.includes(search.title) && book[search.index] != null)
            {
                searchable += book[search.index].toLowerCase() + " ";
            }
        });

        var match = true;

        var blocks = Filter.searchQueryElement.val();
        if (!(blocks === null || blocks.match(/^ *$/) !== null))
        {
            match = false;
            blocks.split("OR").forEach(block =>
            {
                var foundAll = true;
                let operators = [];
                operators["AND"] = function (text, searchable)
                {
                    if (searchable.includes(text))
                    {
                        return true;
                    }
                };
                operators["NOT"] = function (text, searchable)
                {
                    if (!searchable.includes(text))
                    {
                        return true;
                    }
                };

                const regexStr = '(?=' + Object.keys(operators).join("|") + ')';
                const searchRegEx = new RegExp(regexStr, 'g');

                block.split(searchRegEx).forEach(text =>
                {
                    let operator = text.split(" ")[0];
                    if (operator in operators)
                    {
                        text = text.substring(operator.length);
                    }
                    else
                    {
                        operator = Object.keys(operators)[0];
                    }
                    text = text.trim();

                    foundAll = operators[operator](text.toLowerCase(), searchable) ? foundAll : false;
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
        var show = Filter.statusSelectElement.val();
        if (show == "all")
        {
            return true;
        }
        return book["status"] == show;
    }

    static onSearchIncludeSelectChange()
    {
        if (JSON.stringify(Filter.searchInclude) != JSON.stringify(Filter.searchIncludeElement.selectpicker('val')))
        {
            Filter.searchInclude = Filter.searchIncludeElement.selectpicker('val');
            Cookie.set(Filter.searchIncludeCookieName, JSON.stringify(Filter.searchInclude));
            Layout.refresh();
        }
    }

    static onStatusChange()
    {
        var value = Filter.statusSelectElement.val();
        Cookie.set(Filter.statusCookieName, value);
        Layout.refresh();
    }

    static setStatusOptions()
    {
        API.simple("book-hub", "view/all-status", "",
            function (result)
            {
                if (result["success"] == true)
                {
                    var options = result["options"];
                    var html = `<option value="all">All</option>`;
                    options.forEach(option =>
                    {
                        html += `<option value="${option}">${Filter.toTitleCase(option)}</option>`;
                    });
                    Filter.statusSelectElement.html(html);
                    Filter.statusSelectElement.val(Cookie.get(Filter.statusCookieName, Filter.statusDefault));
                    Filter.statusSelectElement.on("change", Filter.onStatusChange);
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

class Sorting
{
    static sortByCookieName = "sorting-sort-by";
    static sortByDefault = "[\"0-asc\"]";
    static sortByElement = $("#sort-by");

    static sortingOptions = [
        {
            title: "Title",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["title"], b["title"])
            }
        },
        {
            title: "Authors",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["authors"], b["authors"])
            }
        },
        {
            title: "Categories",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["categories"], b["categories"])
            }
        },
        {
            title: "Publishers",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["publishers"], b["publishers"])
            }
        },
        {
            title: "Release date",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["date"], b["date"])
            }
        },
        {
            title: "ISBN10",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["isbn10"], b["isbn10"])
            }
        },
        {
            title: "ISBN13",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["categories"], b["categories"])
            }
        },
        {
            title: "Status",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["status"], b["status"])
            }
        },
        {
            title: "Pages",
            sorting: function (a, b)
            {
                return Sorting.numberSorting(a["pages"], b["pages"])
            }
        },
        {
            title: "Added",
            sorting: function (a, b)
            {
                return Sorting.stringSorting(a["added"], b["added"])
            }
        },
        {
            title: "Cover color",
            sorting: function (a, b)
            {
                return Sorting.colorHSorting(a["cover-color"], b["cover-color"])
            }
        },
        {
            title: "Cover brightness",
            sorting: function (a, b)
            {
                return Sorting.colorLSorting(a["cover-color"], b["cover-color"])
            }
        },]

    static ready()
    {
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
        Sorting.sortByElement.html(options);
        Sorting.sortByElement.val(JSON.parse(Cookie.get(Sorting.sortByCookieName, Sorting.sortByDefault)));
        Sorting.sortByElement.on("change", Sorting.onSortByChange);
    }

    static sort()
    {
        books.sort(
            Sorting.sortingOptions[Sorting.sortByElement.val().split("-")[0]].sorting
        );
        if (Sorting.sortByElement.val().split("-")[1] != "asc")
        {
            books.reverse();
        }
    }

    static onSortByChange()
    {
        Cookie.set(Sorting.sortByCookieName, JSON.stringify(Sorting.sortByElement.val()));
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

    static numberSorting(a, b)
    {
        if (a == null) return 1;
        if (b == null) return -1;
        if (isNaN(a) == true) return 1;
        if (isNaN(b) == true) return -1;
        return a - b;
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