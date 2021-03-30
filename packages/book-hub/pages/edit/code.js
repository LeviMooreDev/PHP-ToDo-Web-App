var id;
var coverPlaceholder = "/packages/book-hub/static/cover-placeholder.jpg";

$(document).ready(function ()
{
    ready();
});

function ready()
{
    $('input[name="pages"]').on('change', onPagesChange);

    $('#save').on('click', save);
    $('#delete').on('click', deleteBook);
    $('#original-title').on('click', originalTitle);

    $('#cover-file').on('change', onCoverFileChange);
    $('#cover-upload').on('click', uploadCover);
    $('#cover-delete').on('click', deleteCover);

    $("#progress-bar").width('0%');
    $("#progress-bar").html('0%');

    id = getUrlParameter("id");

    $(window).resize(onResize);
    onResize();

    setCategoriesAutocomplete();
    setAuthorsAutocomplete();
    setPublisherAutocomplete();
    setStatusOptions(function ()
    {
        load();
    });

    SearchMetadataGoogleBooks.ready();
    SearchCoverOpenLibraryCom.ready();
    GoodReads.ready();
    Files.ready();
}

function setCategoriesAutocomplete()
{
    API.simple("book-hub", "view/all-categories", "",
        function (result)
        {
            if (result["success"] == true)
            {
                setAutocomplete('input[name="categories"]', result["categories"]);
            }
            else if (result["success"] == false)
            {
                console.log("Set categories autocomplete failed");
                console.log(result);
            }
        },
        function (result) //failed
        {
            console.log("Set categories autocomplete failed");
            console.log(result);
        }
    );
}

function setAuthorsAutocomplete()
{
    API.simple("book-hub", "view/all-authors", "",
        function (result)
        {
            if (result["success"] == true)
            {
                setAutocomplete('input[name="authors"]', result["authors"]);
            }
            else if (result["success"] == false)
            {
                console.log("Set authors autocomplete failed");
                console.log(result);
            }
        },
        function (result) //failed
        {
            console.log("Set authors autocomplete failed");
            console.log(result);
        }
    );
}

function setPublisherAutocomplete()
{
    API.simple("book-hub", "view/all-publishers", "",
        function (result)
        {
            if (result["success"] == true)
            {
                setAutocomplete('input[name="publishers"]', result["publishers"]);
            }
            else if (result["success"] == false)
            {
                console.log("Set publishers autocomplete failed");
                console.log(result);
            }
        },
        function (result) //failed
        {
            console.log("Set publishers autocomplete failed");
            console.log(result);
        }
    );
}

function setAutocomplete(finder, values)
{
    $(finder).attr("data-list", values);
    new Awesomplete(finder,
        {
            filter: function (text, input)
            {
                return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
            },

            item: function (text, input)
            {
                return Awesomplete.ITEM(text, input.match(/[^,]*$/)[0]);
            },

            replace: function (text)
            {
                var before = this.input.value.match(/^.+,\s*|/)[0];
                this.input.value = before + text + ", ";
            }
        });
}

function onResize()
{
    $("#cover").attr("height", $("#cover").width() * 1.4);
}

function save()
{
    disableForm();
    var title = $('input[name="title"]').val().trim();
    if (!title || title == null || title == "")
    {
        Alert.error("Title is missing");
        return;
    }

    var data = {
        id: id,
        title: title,
        subtitle: $('input[name="subtitle"]').val(),
        description: $('textarea[name="description"]').val(),
        authors: $('input[name="authors"]').val(),
        categories: $('input[name="categories"]').val(),
        publishers: $('input[name="publishers"]').val(),
        date: $('input[name="date"]').val(),
        isbn13: $('input[name="isbn13"]').val(),
        isbn10: $('input[name="isbn10"]').val(),
        pages: $('input[name="pages"]').val(),
        status: $('select[name="status"]').val()
    }
    API.simple("book-hub", "edit/save", data,
        function (result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
            enableForm();
        },
        function (result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
            enableForm();
        }
    );
}

function setStatusOptions(callback)
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
                $('select[name="status"]').html(html);
                if (callback)
                {
                    callback();
                }
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

function load()
{
    disableForm();
    var data = {
        id: id
    };
    API.simple("book-hub", "view/book", data,
        function (result)
        {
            if (result["success"] == true)
            {
                var data = result["data"];
                $('input[name="title"]').val(data["title"]);
                $('input[name="subtitle"]').val(data["subtitle"]);
                $('textarea[name="description"]').val(data["description"]);
                $('input[name="authors"]').val(data["authors"]);
                $('input[name="categories"]').val(data["categories"]);
                $('input[name="publishers"]').val(data["publishers"]);
                $('input[name="date"]').val(data["date"]);
                $('input[name="pages"]').val(data["pages"]);
                $('select[name="status"]').val(data["status"]);
                $('#added').html("Added: " + data["created_timestamp"]);
                $('#updated').html("Updated: " + data["update_timestamp"]);
                setCoverSrc(data["cover-100"], data["cover-color"]);
                if (data["isbn13"] !== null)
                {
                    $('input[name="isbn13"]').val(data["isbn13"]);
                }
                if (data["isbn10"] !== null)
                {
                    $('input[name="isbn10"]').val(data["isbn10"]);
                }

                $('#read').attr("href", "/books/view?id=" + id)
                enableForm();
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function (result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}

function deleteBook()
{
    Alert.yesNo("Are you sure you want to delete the book?",
        function ()
        {
            var data = {
                id: id
            };
            API.simple("book-hub", "edit/delete", data,
                function (result)
                {
                    if (result["success"] == true)
                    {
                        Alert.success(result["message"]);
                        setTimeout(function ()
                        {
                            window.location = "/books/list";
                        }, 750);
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
        },
        function ()
        {

        }
    );
}

function deleteCover()
{
    Alert.yesNo("Are you sure you want to remove the cover?",
        function ()
        {
            var data = {
                id: id
            };
            API.simple("book-hub", "edit/delete-cover", data,
                function (result)
                {
                    if (result["success"] == true)
                    {
                        Alert.success(result["message"]);
                        setCoverSrc(coverPlaceholder, "fff");
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
        },
        function ()
        {

        }
    );
}

function setCoverSrc(url, backgroundColor)
{
    $("#cover").css('background-color', '#' + backgroundColor);
    $("#cover").attr("src", "");
    $("#cover").attr("src", url + "?t=" + new Date().getTime());
}

function uploadCover()
{
    var files = $('#cover-file').get(0).files;
    var progress = $("#progress-bar");
    if (files.length == 0)
    {
        Alert.error("No cover file selected");
        return false;
    }
    if (files.length > 1)
    {
        Alert.error("More then one cover file selected");
        return false;
    }

    var data = new FormData();
    data.append("file", files[0]);
    data.append("id", id);

    disableForm();
    API.upload("book-hub", "edit/upload-cover", data, progress,
        function (result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);
                setCoverSrc(result["file"], result["cover-color"]);
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
            clearCoverSelect();
            enableForm();
        },
        function (result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
            clearCoverSelect();
            enableForm();
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

function disableForm()
{
    $("#save").attr("disabled", "disabled");
    $("#delete").attr("disabled", "disabled");
    $("#download").attr("disabled", "disabled");
    $("#auto-fill").attr("disabled", "disabled");
    $("fieldset").attr("disabled", "disabled");
}

function enableForm()
{
    $("#save").removeAttr("disabled");
    $("#delete").removeAttr("disabled");
    $("#download").removeAttr("disabled");
    $("#auto-fill").removeAttr("disabled");
    $("fieldset").removeAttr("disabled");
}

function clearCoverSelect()
{
    $('#cover-file').val(null);
}

function onCoverFileChange()
{
    var supportedFormat = ["jpg", "png", "jpeg", "png", "gif", "bmp"];
    var files = $('#cover-file').get(0).files;
    if (files.length == 1)
    {
        var type = files[0]["name"].split('.').pop();
        var typeLowerCase = type.toLowerCase();
        if ($.inArray(typeLowerCase, supportedFormat) < 0)
        {
            Alert.error("Format " + typeLowerCase + " not supported. Use " + supportedFormat.join(', '));
            clearCoverSelect();
            return;
        }
    }

    //file size
    var maxMB = 50;
    if (files[0]["size"] > 1048576 * maxMB)
    {
        Alert.error("File is too big. Max cover size is " + maxMB + "MB");
        clearCoverSelect();
    }
}

function originalTitle()
{
    disableForm();
    var data = {
        id: id
    };
    API.simple("book-hub", "view/original-title", data,
        function (result)
        {
            if (result["success"] == true)
            {
                $('input[name="title"]').val(result["title"]);
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
            enableForm();
        },
        function (result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
            enableForm();
        }
    );
}

function onPagesChange()
{
    if ($('input[name="pages"]').val() == "")
    {
        $('input[name="pages"]').val(0);
    }
    if ($('input[name="pages"]').val() < "0")
    {
        $('input[name="pages"]').val(0);
    }
}

class SearchMetadataGoogleBooks
{
    static modal = '#search-metadata-google-books-modal';
    static openButton = '#search-metadata-google-books-open';
    static searchQueryInput = '#search-metadata-google-books-search-query';
    static searchLanguage = '#search-metadata-google-books-search-language';
    static pageButtons = '#search-metadata-google-books-page-buttons';
    static pageButtonClass = 'search-metadata-google-books-page-button';
    static coverImg = '#search-metadata-google-books-cover';
    static searchButton = '#search-metadata-google-books-search-button';
    static applyEverythingButton = '#search-metadata-google-books-apply-everything';
    static applyTextButton = '#search-metadata-google-books-apply-text';
    static applyCoverButton = '#search-metadata-google-books-apply-cover';

    static searchResults = [];
    static pageIndex = 0;

    static ready()
    {
        $(SearchMetadataGoogleBooks.applyEverythingButton).on('click', function ()
        {
            SearchMetadataGoogleBooks.apply("everything");
        });
        $(SearchMetadataGoogleBooks.applyTextButton).on('click', function ()
        {
            SearchMetadataGoogleBooks.apply("text");
        });
        $(SearchMetadataGoogleBooks.applyCoverButton).on('click', function ()
        {
            SearchMetadataGoogleBooks.apply("cover");
        });

        $(SearchMetadataGoogleBooks.openButton).on('click', SearchMetadataGoogleBooks.open);
        $(SearchMetadataGoogleBooks.searchButton).on('click', SearchMetadataGoogleBooks.search);
        $(SearchMetadataGoogleBooks.searchQueryInput).keyup(function (e)
        {
            if (e.keyCode == 13)
            {
                SearchMetadataGoogleBooks.search();
            }
        });
        SearchMetadataGoogleBooks.updatePage();
    }

    static open()
    {
        var isbn13 = $('input[name="isbn13"]').val();
        var isbn10 = $('input[name="isbn10"]').val();
        var title = $('input[name="title"]').val();
        var query;
        if (isbn13)
        {
            query = isbn13;
        }
        else if (isbn10)
        {
            query = isbn10;
        }
        else if (title)
        {
            query = title;
        }
        if (query && SearchMetadataGoogleBooks.searchResults.length == 0)
        {
            $(SearchMetadataGoogleBooks.searchQueryInput).val(query);
            SearchMetadataGoogleBooks.search();
        }
        $(SearchMetadataGoogleBooks.modal).modal('show');
    }

    static search()
    {
        Alert.working(() =>
        {
            var data = {
                language: $(SearchMetadataGoogleBooks.searchLanguage).val(),
                query: $(SearchMetadataGoogleBooks.searchQueryInput).val()
            };
            API.simple("book-hub", "edit/search-metadata-google-book", data,
                function (result)
                {
                    if (result["success"] == true)
                    {
                        if (result["books"].length != 0)
                        {
                            Alert.success(result["message"]);
                        }
                        else
                        {
                            Alert.error(result["message"]);
                        }
                        SearchMetadataGoogleBooks.searchResults = result["books"];
                        SearchMetadataGoogleBooks.pageIndex = 0;
                        SearchMetadataGoogleBooks.updatePage();
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
        });
    }

    static updatePage()
    {
        $(SearchMetadataGoogleBooks.pageButtons).html("");
        if (SearchMetadataGoogleBooks.searchResults.length == 0)
        {
            $(SearchMetadataGoogleBooks.applyButton).attr("disabled", "disabled");
            var elements = ["title", "subtitle", "categories", "description", "authors", "publishers", "date", "isbn13", "isbn10", "cover", "title"];
            elements.forEach(element =>
            {
                SearchMetadataGoogleBooks.updatePageTextElement(element, null);
            });
        }
        else
        {
            if (SearchMetadataGoogleBooks.searchResults.length > 1)
            {
                for (let i = 0; i < SearchMetadataGoogleBooks.searchResults.length; i++)
                {
                    $(SearchMetadataGoogleBooks.pageButtons).append(`<button class="btn btn-${i == SearchMetadataGoogleBooks.pageIndex ? "primary" : "secondary"} ${SearchMetadataGoogleBooks.pageButtonClass}" onclick="SearchMetadataGoogleBooks.clickPageButton(${i})">${i + 1}</button>`);
                }
            }

            var data = SearchMetadataGoogleBooks.searchResults[SearchMetadataGoogleBooks.pageIndex];
            SearchMetadataGoogleBooks.updatePageTextElement("title", data.title);
            SearchMetadataGoogleBooks.updatePageTextElement("subtitle", data.subtitle);
            SearchMetadataGoogleBooks.updatePageTextElement("categories", data.categories);
            SearchMetadataGoogleBooks.updatePageTextElement("description", data.description);
            SearchMetadataGoogleBooks.updatePageTextElement("authors", data.authors);
            SearchMetadataGoogleBooks.updatePageTextElement("publishers", data.publishers);
            SearchMetadataGoogleBooks.updatePageTextElement("date", data.date);
            SearchMetadataGoogleBooks.updatePageTextElement("isbn13", data.isbn13);
            SearchMetadataGoogleBooks.updatePageTextElement("isbn10", data.isbn10);
            SearchMetadataGoogleBooks.updatePageTextElement("cover", data.cover);
            SearchMetadataGoogleBooks.updatePageTextElement("title", data.title);

            var cover = SearchMetadataGoogleBooks.searchResults[SearchMetadataGoogleBooks.pageIndex].cover;
            if (cover)
            {
                $(SearchMetadataGoogleBooks.coverImg).attr("src", cover);
            }
            else
            {
                $(SearchMetadataGoogleBooks.coverImg).attr("src", coverPlaceholder);
            }

            $(SearchMetadataGoogleBooks.applyButton).removeAttr("disabled");
        }
    }
    static updatePageTextElement(name, value)
    {
        if (value)
        {
            $("#search-metadata-google-books-" + name).html(value);
        }
        else
        {
            $("#search-metadata-google-books-" + name).html("N/A");
        }
    }

    static apply(what)
    {
        Alert.working(() =>
        {
            if (what == "everything")
            {
                SearchMetadataGoogleBooks.applyCover(
                    function (coverResult)
                    { // cover success
                        SearchMetadataGoogleBooks.applyText(
                            function (textResult)
                            { // cover success, text success
                                Alert.success(coverResult + ". " + textResult);
                                $(SearchMetadataGoogleBooks.modal).modal('hide');
                            },
                            function (textResult)
                            { // cover success, text fail
                                Alert.success(coverResult + ". " + textResult);
                                $(SearchMetadataGoogleBooks.modal).modal('hide');
                            }
                        );
                    },
                    function (coverResult)
                    { // cover fail
                        SearchMetadataGoogleBooks.applyText(
                            function (textResult)
                            { // cover fail, text success
                                Alert.success(coverResult + ". " + textResult);
                                $(SearchMetadataGoogleBooks.modal).modal('hide');
                            },
                            function (textResult)
                            { // cover fail, text fail
                                Alert.success(coverResult + ". " + textResult);
                                $(SearchMetadataGoogleBooks.modal).modal('hide');
                            }
                        );
                    }
                );
            }
            if (what == "text")
            {
                SearchMetadataGoogleBooks.applyText(
                    function (textResult)
                    { // cover success, text success
                        Alert.success(textResult);
                        $(SearchMetadataGoogleBooks.modal).modal('hide');
                    },
                    function (textResult)
                    { // cover success, text fail
                        Alert.success(textResult);
                        $(SearchMetadataGoogleBooks.modal).modal('hide');
                    }
                );
            }
            if (what == "cover")
            {
                SearchMetadataGoogleBooks.applyCover(
                    function (coverResult)
                    { // cover success, text success
                        Alert.success(coverResult);
                        $(SearchMetadataGoogleBooks.modal).modal('hide');
                    },
                    function (coverResult)
                    { // cover success, text fail
                        Alert.success(coverResult);
                        $(SearchMetadataGoogleBooks.modal).modal('hide');
                    }
                );
            }
        });
    }
    static applyCover(callbackSuccess, callbackFail)
    {
        var data = SearchMetadataGoogleBooks.searchResults[SearchMetadataGoogleBooks.pageIndex];
        var cover = data.cover;
        if (cover != null)
        {
            var data = {
                id: id,
                url: cover
            }
            API.simple("book-hub", "edit/upload-cover-from-url", data,
                function (result)
                {
                    if (result["success"] == true)
                    {
                        setCoverSrc(result["file"], result["cover-color"]);
                        callbackSuccess("Cover applied");
                    }
                    else if (result["success"] == false)
                    {
                        console.log(result["message"]);
                        callbackFail("Cover apply failed");
                    }
                },
                function (result)
                {
                    console.log(result);
                    callbackFail("Cover apply failed");
                }
            );
        }
    }
    static applyText(callbackSuccess, callbackFail)
    {
        var data = SearchMetadataGoogleBooks.searchResults[SearchMetadataGoogleBooks.pageIndex];

        var title = data.title.trim();
        if (!title || title == null || title == "")
        {
            Alert.error("Title is missing");
            return false;
        }

        var date = "";
        try
        {
            date = new Date(data.date).toISOString().substring(0, 10);
        }
        catch (error)
        { }

        var status = $('select[name="status"]').val();
        var pages = $('input[name="pages"]').val();
        if (!pages)
        {
            pages = 0;
        }

        var data = {
            id: id,
            title: title,
            subtitle: data.subtitle,
            description: data.description,
            authors: data.authors,
            categories: data.categories,
            publishers: data.publishers,
            date: date,
            isbn13: data.isbn13,
            isbn10: data.isbn10,
            status: status,
            pages: pages
        }
        API.simple("book-hub", "edit/save", data,
            function (result)
            {
                if (result["success"] == true)
                {
                    $('input[name="title"]').val(title);
                    $('input[name="subtitle"]').val(data.subtitle);
                    $('textarea[name="description"]').val(data.description);
                    $('input[name="authors"]').val(data.authors);
                    $('input[name="categories"]').val(data.categories);
                    $('input[name="publishers"]').val(data.publishers);
                    $('input[name="date"]').val(date);
                    $('input[name="isbn13"]').val(data.isbn13);
                    $('input[name="isbn10"]').val(data.isbn10);
                    callbackSuccess("Text applied");
                }
                else if (result["success"] == false)
                {
                    console.log(result["message"]);
                    callbackFail("Text apply failed");
                }
            },
            function (result)
            {
                console.log(result);
                callbackFail("Text apply failed");
            }
        );
    }

    static clickPageButton(index)
    {
        SearchMetadataGoogleBooks.pageIndex = index;
        SearchMetadataGoogleBooks.updatePage();
    }
}

class SearchCoverOpenLibraryCom
{
    static modal = '#search-cover-open-library-modal';
    static openButton = '#search-cover-open-library-open';
    static searchQueryInput = '#search-cover-open-library-search-query';
    static pageButtons = '#search-cover-open-library-page-buttons';
    static pageButtonClass = 'search-cover-open-library-page-button';
    static coverImg = '#search-cover-open-library-img';
    static applyButton = '#search-cover-open-library-apply';
    static searchButton = '#search-cover-open-library-search-button';

    static searchResults = [];
    static pageIndex = 0;

    static ready()
    {
        $(SearchCoverOpenLibraryCom.openButton).on('click', SearchCoverOpenLibraryCom.open);
        $(SearchCoverOpenLibraryCom.searchButton).on('click', SearchCoverOpenLibraryCom.search);
        $(SearchCoverOpenLibraryCom.applyButton).on('click', SearchCoverOpenLibraryCom.apply);
        $(SearchCoverOpenLibraryCom.searchQueryInput).keyup(function (e)
        {
            if (e.keyCode == 13)
            {
                SearchCoverOpenLibraryCom.search();
            }
        });
        SearchCoverOpenLibraryCom.updatePage();
    }

    static open()
    {
        var title = $('input[name="title"]').val();
        if (title && SearchCoverOpenLibraryCom.searchResults.length == 0)
        {
            $(SearchCoverOpenLibraryCom.searchQueryInput).val(title);
            SearchCoverOpenLibraryCom.search();
        }
        $(SearchCoverOpenLibraryCom.modal).modal('show');
    }

    static search()
    {
        $(SearchCoverOpenLibraryCom.coverImg).attr("src", coverPlaceholder);
        Alert.working(() =>
        {
            var query = $(SearchCoverOpenLibraryCom.searchQueryInput).val().replace(/[^a-z0-9\s]/gi, '');
            var data = {
                query: query
            };
            API.simple("book-hub", "edit/search-cover-open-library", data,
                function (result)
                {
                    if (result["success"] == true)
                    {
                        if (result["covers"].length != 0)
                        {
                            Alert.success(result["message"]);
                        }
                        else
                        {
                            Alert.error(result["message"]);
                        }
                    }
                    else if (result["success"] == false)
                    {
                        Alert.error(result["message"]);
                    }
                    SearchCoverOpenLibraryCom.searchResults = result["covers"];
                    SearchCoverOpenLibraryCom.pageIndex = 0;
                    SearchCoverOpenLibraryCom.updatePage();
                },
                function (result)
                {
                    Alert.error("Something went wrong. See console (F12) for more info.");
                    console.log(result);
                }
            );
        });
    }

    static updatePage()
    {
        $(SearchCoverOpenLibraryCom.pageButtons).html("");
        if (SearchCoverOpenLibraryCom.searchResults.length == 0)
        {
            $(SearchCoverOpenLibraryCom.applyButton).attr("disabled", "disabled");
        }
        else
        {
            if (SearchCoverOpenLibraryCom.searchResults.length > 1)
            {
                for (let i = 0; i < SearchCoverOpenLibraryCom.searchResults.length; i++)
                {
                    $(SearchCoverOpenLibraryCom.pageButtons).append(`<button class="btn btn-${i == SearchCoverOpenLibraryCom.pageIndex ? "primary" : "secondary"} ${SearchCoverOpenLibraryCom.pageButtonClass}" onclick="SearchCoverOpenLibraryCom.clickPageButton(${i})">${i + 1}</button>`);
                }
            }

            var coverUrl = SearchCoverOpenLibraryCom.searchResults[SearchCoverOpenLibraryCom.pageIndex];
            $(SearchCoverOpenLibraryCom.coverImg).attr("src", coverUrl);
            $(SearchCoverOpenLibraryCom.applyButton).removeAttr("disabled");
        }
    }

    static clickPageButton(index)
    {
        SearchCoverOpenLibraryCom.pageIndex = index;
        SearchCoverOpenLibraryCom.updatePage();
    }

    static apply()
    {
        Alert.working(() =>
        {
            var coverUrl = SearchCoverOpenLibraryCom.searchResults[SearchCoverOpenLibraryCom.pageIndex];
            {
                var data = {
                    id: id,
                    url: coverUrl
                }
                API.simple("book-hub", "edit/upload-cover-from-url", data,
                    function (result)
                    {
                        if (result["success"] == true)
                        {
                            setCoverSrc(result["file"], result["cover-color"]);
                            $(SearchCoverOpenLibraryCom.modal).modal('hide');
                            Alert.success("Cover applied");
                        }
                        else if (result["success"] == false)
                        {
                            Alert.error("Unable to apply cover");
                            console.log(result["message"]);
                            Alert.workingDone();
                        }
                    },
                    function (result)
                    {
                        Alert.error("Unable to apply cover");
                        console.log(result["message"]);
                        Alert.workingDone();
                    }
                );
            }
        });
    }
}

class GoodReads
{
    static button = '#search-good-reads';

    static ready()
    {
        $(GoodReads.button).on('click', GoodReads.search);
    }

    static search()
    {
        var query = $('input[name="title"]').val();
        query = encodeURI(query);
        window.open("https://www.goodreads.com/search?q=" + query, "_blank");
    }
}

class Files
{
    static modal;
    static openButton;
    static submitButton;
    static files;
    static progressBar;

    static ready()
    {
        Files.modal = $("#files-modal");
        Files.openButton = $("#files-action");
        Files.submitButton = $("#files-submit");
        Files.files = $("#files-upload-input");
        Files.progressBar = $("#files-progress-bar");

        Files.openButton.on('click', Files.open);
        Files.files.on('change', Files.filesSelectUpdate);
        Files.submitButton.on('click', Files.upload);

        Files.progressBar.width('0%');
        Files.progressBar.html('0%');

        Files.updateList();
    }

    static open()
    {
        Files.clearFiles();
        Files.modal.modal('show');
    }

    static upload()
    {
        var files = Files.files.get(0).files;
        var count = files.length;
    
        //check if no files are selected
        if (count === 0)
        {
            Alert.error("No file selected.");
            return;
        }
    
        //prepare data
        var data = new FormData();
        for (var i = 0; i < count; i++)
        {
            data.append("files[]", files[i]);
        }
        data.append("id", id);
    
        //call upload api
        Files.disableForm();
        API.upload("book-hub", "edit/upload", data, Files.progressBar,
            function(result)
            {
                if (result["success"] == true)
                {
                    Alert.success(result["message"]);
                }
                else if (result["success"] == false)
                {
                    Alert.error(result["message"]);
                }
                Files.enableForm();
                Files.clearFiles();
                Files.updateList();
            },
            function(result) //failed
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
                Files.enableForm();
                Files.clearFiles();
            }
        );
    }

    static remove(type)
    {
        var data = {
            id: id,
            type: type,
        }
        API.simple("book-hub", "edit/remove-file", data,
            function (result)
            {
                if (result["success"] == true)
                {
                    Alert.success(result["message"]);
                }
                else if (result["success"] == false)
                {
                    Alert.error(result["message"]);
                }
                Files.updateList();
            },
            function (result)
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
                console.log(result);
            }
        );
    }

    static download(format)
    {
        window.open(`/packages/book-hub/api/download.php?id=${id}&format=${format}`);
    }

    static filesSelectUpdate()
    {
        var files = Files.files.get(0).files;
        var count = files.length;

        //check for unsupported files
        var supportedFormat = ['pdf', 'epub'];
        for (var i = 0; i < count; i++)
        {
            var type = files[i]["name"].split('.').pop();
            if ($.inArray(type, supportedFormat) < 0)
            {
                Alert.error("Format " + type + " not supported. Use " + supportedFormat.join(', '));
                Files.clearFiles();
                return;
            }
        }

        //file size
        var totalSize = 0;
        var maxMB = maxUploadSize - 10;
        for (var i = 0; i < count; i++)
        {
            totalSize += files[i]["size"];
        }
        if (totalSize > 1048576 * maxMB)
        {
            Alert.error("Files are too big. Can only upload a combined " + maxMB + "MB");
            Files.clearFiles();
        }
    }

    static clearFiles()
    {
        Files.files.val(null);
    }

    static disableForm()
    {
        Files.submitButton.attr("disabled", "disabled");
        Files.files.attr("disabled", "disabled");
    }

    static enableForm()
    {
        Files.submitButton.removeAttr("disabled");
        Files.files.removeAttr("disabled");
    }

    static updateList()
    {
        var data = {
            id: id,
        }
        API.simple("book-hub", "view/files", data,
            function (result)
            {
                if (result["success"] == true)
                {
                    $("#uploaded-files").hide();
                    $("#uploaded-epub").hide();
                    $("#uploaded-pdf").hide();

                    if(result["files"]["epub"])
                    {
                        $("#uploaded-files").show();
                        $("#uploaded-epub").show();
                    }
                    if(result["files"]["pdf"])
                    {
                        $("#uploaded-files").show();
                        $("#uploaded-pdf").show();
                    }
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
}