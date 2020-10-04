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

    $('#search-cover').on('click', SearchCover.open);

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

    AutoFill.ready();
    SearchCover.ready();
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
                    $('input[name="isbn13"]').val(parseInt(data["isbn13"]));
                }
                if (data["isbn10"] !== null)
                {
                    $('input[name="isbn10"]').val(parseInt(data["isbn10"]));
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
        if ($.inArray(type, supportedFormat) < 0)
        {
            Alert.error("Format " + type + " not supported. Use " + supportedFormat.join(', '));
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

class AutoFill
{
    static searchResults = [];
    static pageIndex = 0;

    static ready()
    {
        $('#auto-fill').on('click', AutoFill.open);
        $('#auto-fill-search-button').on('click', AutoFill.search);
        $('#auto-fill-apply').on('click', AutoFill.apply);
        $('#auto-fill-search-query').keyup(function(e)
        {
            if (e.keyCode == 13)
            {
                AutoFill.search();
            }
        });
        AutoFill.updatePage();
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
        if (query && AutoFill.searchResults.length == 0)
        {
            $('#auto-fill-search-query').val(query);
            AutoFill.search();
        }
        $('#autoFillModal').modal('show');
    }

    static search()
    {
        Alert.working(() =>
        {
            var data = {
                language: $('#auto-fill-language').val(),
                query: $('#auto-fill-search-query').val()
            };
            API.simple("book-hub", "edit/search-metadata", data,
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
                        AutoFill.searchResults = result["books"];
                        AutoFill.pageIndex = 0;
                        AutoFill.updatePage();
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
        $("#auto-fill-page-buttons").html("");
        if (AutoFill.searchResults.length == 0)
        {
            $("#auto-fill-search-apply").attr("disabled", "disabled");
            var elements = ["title", "subtitle", "categories", "description", "authors", "publisher", "date", "isbn13", "isbn10", "cover", "title"];
            elements.forEach(element =>
            {
                AutoFill.updatePageTextElement(element, null);
            });
        }
        else
        {
            if (AutoFill.searchResults.length > 1)
            {
                for (let i = 0; i < AutoFill.searchResults.length; i++)
                {
                    $("#auto-fill-page-buttons").append(`<button class="btn btn-${i == AutoFill.pageIndex ? "primary" : "secondary"} auto-fill-page-button" onclick="AutoFill.clickPageButton(${i})">${i + 1}</button>`);
                }
            }

            var data = AutoFill.searchResults[AutoFill.pageIndex];
            AutoFill.updatePageTextElement("title", data.title);
            AutoFill.updatePageTextElement("subtitle", data.subtitle);
            AutoFill.updatePageTextElement("categories", data.categories);
            AutoFill.updatePageTextElement("description", data.description);
            AutoFill.updatePageTextElement("authors", data.authors);
            AutoFill.updatePageTextElement("publisher", data.publisher);
            AutoFill.updatePageTextElement("date", data.date);
            AutoFill.updatePageTextElement("isbn13", data.isbn13);
            AutoFill.updatePageTextElement("isbn10", data.isbn10);
            AutoFill.updatePageTextElement("cover", data.cover);
            AutoFill.updatePageTextElement("title", data.title);

            var cover = AutoFill.searchResults[AutoFill.pageIndex].cover;
            if (cover)
            {
                $("#auto-fill-cover").attr("src", cover);
            }
            else
            {
                $("#auto-fill-cover").attr("src", coverPlaceholder);
            }

            $("#auto-fill-search-apply").removeAttr("disabled");
        }
    }
    static updatePageTextElement(name, value)
    {
        if (value)
        {
            $("#auto-fill-" + name).html(value);
        }
        else
        {
            $("#auto-fill-" + name).html("N/A");
        }
    }

    static apply()
    {
        Alert.working(() =>
        {
            var data = AutoFill.searchResults[AutoFill.pageIndex];
            $('input[name="title"]').val(data.title);
            $('input[name="subtitle"]').val(data.subtitle);
            $('textarea[name="description"]').val(data.description);
            $('input[name="authors"]').val(data.authors);
            $('input[name="categories"]').val(data.categories);
            $('input[name="publisher"]').val(data.publisher);
            $('input[name="date"]').val(data.date);
            $('input[name="isbn13"]').val(data.isbn13);
            $('input[name="isbn10"]').val(data.isbn10);
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
                        }
                        else if (result["success"] == false)
                        {
                            Alert.error("Unable to apply cover. Other metadata is still applied");
                            console.log(result["message"]);
                        }
                        AutoFill.saveApplied();
                    },
                    function(result)
                    {
                        Alert.error("Unable to apply cover. Other metadata is still applied");
                        console.log(result["message"]);
                        AutoFill.saveApplied();
                    }
                );
            }
            else
            {
                AutoFill.saveApplied();
            }
        });
    }
    static saveApplied()
    {
        save();
        $('#autoFillModal').modal('hide');
    }

    static clickPageButton(index)
    {
        AutoFill.pageIndex = index;
        AutoFill.updatePage();
    }
}

class SearchCover
{
    static modal = '#high-res-cover-modal';
    static openButton = '#high-res-cover-open';
    static searchQueryInput = '#high-res-cover-search-query';
    static pageButtons = '#high-res-cover-page-buttons';
    static pageButtonClass = 'high-res-cover-page-button';
    static coverImg = '#high-res-cover';
    static applyButton = '#high-res-cover-apply';
    static searchButton = '#high-res-cover-search-button';

    static searchResults = [];
    static pageIndex = 0;

    static ready()
    {
        $(SearchCover.openButton).on('click', SearchCover.open);
        $(SearchCover.searchButton).on('click', SearchCover.search);
        $(SearchCover.applyButton).on('click', SearchCover.apply);
        $(SearchCover.searchQueryInput).keyup(function(e)
        {
            if (e.keyCode == 13)
            {
                SearchCover.search();
            }
        });
        updatePage();
    }

    static open()
    {
        var title = $('input[name="title"]').val();
        if (title && SearchCover.searchResults.length == 0)
        {
            $(SearchCover.searchQueryInput).val(title);
            SearchCover.search();
        }
        $(SearchCover.modal).modal('show');
    }

    static search()
    {
        $(SearchCover.coverImg).attr("src", coverPlaceholder);
        Alert.working(() =>
        {
            var data = {
                query: $(SearchCover.searchQueryInput).val()
            };
            API.simple("book-hub", "edit/search-high-res-cover", data,
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
                    SearchCover.searchResults = result["covers"];
                    SearchCover.pageIndex = 0;
                    SearchCover.updatePage();
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
        $(SearchCover.pageButtons).html("");
        if (SearchCover.searchResults.length == 0)
        {
            $(SearchCover.applyButton).attr("disabled", "disabled");
        }
        else
        {
            if (SearchCover.searchResults.length > 1)
            {
                for (let i = 0; i < SearchCover.searchResults.length; i++)
                {
                    $(SearchCover.pageButtons).append(`<button class="btn btn-${i == SearchCover.pageIndex ? "primary" : "secondary"} ${SearchCover.pageButtonClass}" onclick="SearchCover.clickPageButton(${i})">${i + 1}</button>`);
                }
            }

            var coverUrl = SearchCover.searchResults[SearchCover.pageIndex];
            $(SearchCover.coverImg).attr("src", coverUrl);
            $(SearchCover.applyButton).removeAttr("disabled");
        }
    }

    static clickPageButton(index)
    {
        SearchCover.pageIndex = index;
        SearchCover.updatePage();
    }

    static apply()
    {
        Alert.working(() =>
        {
            var coverUrl = SearchCover.searchResults[SearchCover.pageIndex];
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
                            $(SearchCover.modal).modal('hide');
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