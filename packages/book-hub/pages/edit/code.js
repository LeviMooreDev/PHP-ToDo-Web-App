$(document).ready(function()
{
    $('#save').on('click', save);
    $('#delete').on('click', deleteBook);
    $('#download').on('click', download);
    $('#auto-fill').on('click', autoFill);
    $('input[name="isbn13"]').on('change', onIsbn13Change);
    $('input[name="isbn10"]').on('change', onIsbn10Change);

    ready();
});

function ready()
{
    disableForm();
    load();
}

function save()
{

}

function load()
{
    var data = {
        id: getUrlParameter("id")
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

function autoFill()
{

}

function download()
{

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
    $("#auto-fill").attr("disabled", "disabled");
    $("fieldset").attr("disabled", "disabled");
}

function enableForm()
{
    $("#save").removeAttr("disabled");
    $("#delete").removeAttr("disabled");
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