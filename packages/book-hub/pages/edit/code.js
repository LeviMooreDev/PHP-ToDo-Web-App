var id;

$(document).ready(function()
{
    $("#cover-form").on('submit', function(e)
    {
        e.preventDefault();
        uploadCover();
    });
    $('#save').on('click', save);
    $('#delete').on('click', deleteBook);
    $('#download').on('click', download);
    $('#auto-fill').on('click', autoFill);
    $('input[name="isbn13"]').on('change', onIsbn13Change);
    $('input[name="isbn10"]').on('change', onIsbn10Change);
    $('#cover-file').on('change', onCoverFileChange);
    $(window).resize(onResize);

    ready();
});

function ready()
{
    id = getUrlParameter("id");
    disableForm();
    load();
    onResize();
    $("#progress-bar").width('0%');
    $("#progress-bar").html('0%');
}

function onResize()
{
    $("#cover").attr("height", $("#cover").width() * 1.4);
}

function save()
{

}

function load()
{
    var data = {
        id: id
    };
    API.simple("book-hub", "edit/get-metadata", data,
        function(result)
        {
            if (result["success"] == true)
            {
                var metadate = result["metadata"];
                $('input[name="title"]').val(metadate["title"]);
                $('input[name="subtitle"]').val(metadate["subtitle"]);
                $('textarea[name="description"]').val(metadate["description"]);
                $('input[name="authors"]').val(metadate["authors"]);
                $('input[name="categories"]').val(metadate["categories"]);
                $('input[name="publisher"]').val(metadate["publisher"]);
                $('input[name="date"]').val(metadate["date"]);
                $('input[name="isbn13"]').val(parseInt(metadate["isbn13"]));
                $('input[name="isbn10"]').val(parseInt(metadate["isbn10"]));
                $('#added').html("Added: " + metadate["created_timestamp"]);
                $('#updated').html("Updated: " + metadate["update_timestamp"]);
                $('#file').html("File: " + metadate["file"]);
                $("#cover").attr("src", metadate["cover"]);
                $("#cover-id").attr("value", metadate["id"]);

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

}

function uploadCover()
{
    var id = $('#cover-id').val();
    var files = $('#cover-file').get(0).files;
    var progress = $("#progress-bar");
    if (!id)
    {
        Alert.error("Id missing");
        return false;
    }
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
                clearCoverSelect();
                load();
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
                enableForm();
                clearCoverSelect();
            }
        },
        function(result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            enableForm();
            clearCoverSelect();
        }
    );
}

function autoFill()
{

}

function download()
{
    var iDownload = new iframePostFormDownload("http://books.levimoore.dk/packages/book-hub/api/download.php");
    iDownload.addParameter('id', id);
    iDownload.send();
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

//https://stackoverflow.com/questions/3599670/ajax-file-download-using-jquery-php
//Trafalmadorian
function iframePostFormDownload(url)
{
    var object = this;
    object.time = new Date().getTime();
    object.form = $('<form action="' + url + '" target="iframe' + object.time + '" method="post" style="display:none;" id="form' + object.time + '" name="form' + object.time + '"></form>');

    object.addParameter = function(parameter, value)
    {
        $("<input type='hidden' />")
            .attr("name", parameter)
            .attr("value", value)
            .appendTo(object.form);
    }

    object.send = function()
    {
        var iframe = $('<iframe data-time="' + object.time + '" style="display:none;" id="iframe' + object.time + '"></iframe>');
        $("body").append(iframe);
        $("body").append(object.form);
        object.form.submit();
        iframe.load(function()
        {
            $('#form' + $(this).data('time')).remove();
            $(this).remove();
        });
    }
}