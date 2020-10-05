var id;
var coverPlaceholder = "/packages/book-hub/cover-placeholder.jpg";

$(document).ready(function()
{
    $('input[name="isbn13"]').on('change', onIsbn13Change);
    $('input[name="isbn10"]').on('change', onIsbn10Change);

    $('#save').on('click', save);
    $('#delete').on('click', deleteBook);
    $('#original-title').on('click', originalTitle);

    $('#cover-file').on('change', onCoverFileChange);
    $('#cover-upload').on('click', uploadCover);
    $('#cover-delete').on('click', deleteCover);

    $('#search-cover').on('click', SearchCoverOpenLibraryCom.open);

    $(window).resize(onResize);

    ready();
});

function ready()
{
    id = getUrlParameter("id");
    load();
    onResize();
    $("#progress-bar").width('0%');
    $("#progress-bar").html('0%');

    SearchMetadataGoogleBooks.ready();
    SearchCoverOpenLibraryCom.ready();
}

function onResize()
{
    $("#cover").attr("height", $("#cover").width() * 1.4);
}

function save()
{
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
        publisher: $('input[name="publisher"]').val(),
        date: $('input[name="date"]').val(),
        isbn13: $('input[name="isbn13"]').val(),
        isbn10: $('input[name="isbn10"]').val(),
        status: $('select[name="status"]').val()
    }
    API.simple("book-hub", "edit/save", data,
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
        },
        function(result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
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
        function(result)
        {
            if (result["success"] == true)
            {
                var data = result["data"];
                $('input[name="title"]').val(data["title"]);
                $('input[name="subtitle"]').val(data["subtitle"]);
                $('textarea[name="description"]').val(data["description"]);
                $('input[name="authors"]').val(data["authors"]);
                $('input[name="categories"]').val(data["categories"]);
                $('input[name="publisher"]').val(data["publisher"]);
                $('input[name="date"]').val(data["date"]);
                $('select[name="status"]').val(data["status"]);
                $('#added').html("Added: " + data["created_timestamp"]);
                $('#updated').html("Updated: " + data["update_timestamp"]);
                setCoverSrc(data["cover"]);
                if (data["isbn13"] !== null)
                {
                    $('input[name="isbn13"]').val(data["isbn13"]);
                }
                if (data["isbn10"] !== null)
                {
                    $('input[name="isbn10"]').val(data["isbn10"]);
                }

                $('#read').attr("href", "/books/view?id=" + id)
                $('#download').attr("href", "/packages/book-hub/api/download.php?id=" + id)
                enableForm();
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function(result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}

function deleteBook()
{
    Alert.yesNo("Are you sure you want to delete the book?",
        function()
        {
            var data = {
                id: id
            };
            API.simple("book-hub", "edit/delete", data,
                function(result)
                {
                    if (result["success"] == true)
                    {
                        Alert.success(result["message"]);
                        setTimeout(function()
                        {
                            window.location = "/books/list";
                        }, 750);
                    }
                    else if (result["success"] == false)
                    {
                        Alert.error(result["message"]);
                    }
                },
                function(result)
                {
                    Alert.error("Something went wrong. See console (F12) for more info.");
                    console.log(result);
                }
            );
        },
        function() {

        }
    );
}

function deleteCover()
{
    Alert.yesNo("Are you sure you want to remove the cover?",
        function()
        {
            var data = {
                id: id
            };
            API.simple("book-hub", "edit/delete-cover", data,
                function(result)
                {
                    if (result["success"] == true)
                    {
                        Alert.success(result["message"]);
                        setCoverSrc(coverPlaceholder);
                    }
                    else if (result["success"] == false)
                    {
                        Alert.error(result["message"]);
                    }
                },
                function(result)
                {
                    Alert.error("Something went wrong. See console (F12) for more info.");
                    console.log(result);
                }
            );
        },
        function() {

        }
    );
}

function setCoverSrc(url)
{
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
        function(result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);
                setCoverSrc(result["file"]);
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
            clearCoverSelect();
            enableForm();
        },
        function(result) //failed
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

function onIsbn13Change()
{
    $('input[name="isbn13"]').val($('input[name="isbn13"]').val().replace(/\D/g, ''));
}

function onIsbn10Change()
{
    $('input[name="isbn10"]').val($('input[name="isbn10"]').val().replace(/\D/g, ''));
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
        function(result)
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
        function(result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
            enableForm();
        }
    );
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
        $(SearchMetadataGoogleBooks.applyEverythingButton).on('click', function()
        {
            SearchMetadataGoogleBooks.apply("everything");
        });
        $(SearchMetadataGoogleBooks.applyTextButton).on('click', function()
        {
            SearchMetadataGoogleBooks.apply("text");
        });
        $(SearchMetadataGoogleBooks.applyCoverButton).on('click', function()
        {
            SearchMetadataGoogleBooks.apply("cover");
        });

        $(SearchMetadataGoogleBooks.openButton).on('click', SearchMetadataGoogleBooks.open);
        $(SearchMetadataGoogleBooks.searchButton).on('click', SearchMetadataGoogleBooks.search);
        $(SearchMetadataGoogleBooks.searchQueryInput).keyup(function(e)
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
                function(result)
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
                function(result)
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
            var elements = ["title", "subtitle", "categories", "description", "authors", "publisher", "date", "isbn13", "isbn10", "cover", "title"];
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
            SearchMetadataGoogleBooks.updatePageTextElement("publisher", data.publisher);
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
                    function(coverResult)
                    { // cover success
                        SearchMetadataGoogleBooks.applyText(
                            function(textResult)
                            { // cover success, text success
                                Alert.success(coverResult + ". " + textResult);
                                $(SearchMetadataGoogleBooks.modal).modal('hide');
                            },
                            function(textResult)
                            { // cover success, text fail
                                Alert.success(coverResult + ". " + textResult);
                                $(SearchMetadataGoogleBooks.modal).modal('hide');
                            }
                        );
                    },
                    function(coverResult)
                    { // cover fail
                        SearchMetadataGoogleBooks.applyText(
                            function(textResult)
                            { // cover fail, text success
                                Alert.success(coverResult + ". " + textResult);
                                $(SearchMetadataGoogleBooks.modal).modal('hide');
                            },
                            function(textResult)
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
                    function(textResult)
                    { // cover success, text success
                        Alert.success(textResult);
                        $(SearchMetadataGoogleBooks.modal).modal('hide');
                    },
                    function(textResult)
                    { // cover success, text fail
                        Alert.success(textResult);
                        $(SearchMetadataGoogleBooks.modal).modal('hide');
                    }
                );
            }
            if (what == "cover")
            {
                SearchMetadataGoogleBooks.applyCover(
                    function(coverResult)
                    { // cover success, text success
                        Alert.success(coverResult);
                        $(SearchMetadataGoogleBooks.modal).modal('hide');
                    },
                    function(coverResult)
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
                function(result)
                {
                    if (result["success"] == true)
                    {
                        setCoverSrc(result["file"]);
                        callbackSuccess("Cover applied");
                    }
                    else if (result["success"] == false)
                    {
                        console.log(result["message"]);
                        callbackFail("Cover apply failed");
                    }
                },
                function(result)
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
        {}

        var status = $('select[name="status"]').val();

        var data = {
            id: id,
            title: title,
            subtitle: data.subtitle,
            description: data.description,
            authors: data.authors,
            categories: data.categories,
            publisher: data.publisher,
            date: date,
            isbn13: data.isbn13,
            isbn10: data.isbn10,
            status: status
        }
        API.simple("book-hub", "edit/save", data,
            function(result)
            {
                if (result["success"] == true)
                {
                    $('input[name="title"]').val(title);
                    $('input[name="subtitle"]').val(data.subtitle);
                    $('textarea[name="description"]').val(data.description);
                    $('input[name="authors"]').val(data.authors);
                    $('input[name="categories"]').val(data.categories);
                    $('input[name="publisher"]').val(data.publisher);
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
            function(result)
            {
                console.log(result);
                callbackFail("Text apply failed");
            }
        );
    }


    //all -> cover -
    //cover
    //text

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
        $(SearchCoverOpenLibraryCom.searchQueryInput).keyup(function(e)
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
            var data = {
                query: $(SearchCoverOpenLibraryCom.searchQueryInput).val()
            };
            API.simple("book-hub", "edit/search-cover-open-library", data,
                function(result)
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
                function(result)
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
                    function(result)
                    {
                        if (result["success"] == true)
                        {
                            setCoverSrc(result["file"]);
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
                    function(result)
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