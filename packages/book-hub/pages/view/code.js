var id;
var totalPageCount = -1;
var statusElement;

$(document).ready(function()
{
    ready();
});

function ready()
{
    id = getUrlParameter("id");
    $("#iframe").attr('src', "/packages/book-hub/pdfjs/iframe.html?file=" + encodeURIComponent("http://books.levimoore.dk/packages/book-hub/api/download.php?id=" + id));
}

function iframeReady(elements)
{
    $(elements["download"]).on("click", function()
    {
        onDownloadClick();
    })
    $(elements["edit"]).on("click", function()
    {
        onEditClick();
    })
    statusElement = $(elements["status"]);
    statusElement.on("change", function()
    {
        onStatusChange();
    })

    updateStatusUI();
}


function setTotalPages(number)
{
    totalPageCount = number;
}

function onPageChange(number)
{
    if (totalPageCount == -1)
    {
        return;
    }
}

function updateStatusUI()
{
    var data = {
        id: id
    }
    API.simple("book-hub", "view/status", data,
        function(result)
        {
            if (result["success"] == true)
            {
                var status = result["status"];
                statusElement.val(status);
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
function onStatusChange()
{
    var data = {
        id: id,
        status: statusElement.val()
    }
    API.simple("book-hub", "edit/status", data,
        function(result)
        {
            if (result["success"] == false)
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

function onDownloadClick()
{
    var iDownload = new iframePostFormDownload("http://books.levimoore.dk/packages/book-hub/api/download.php?id=" + id);
    iDownload.addParameter('id', id);
    iDownload.send();
}
function iframePostFormDownload(url)
{
    //https://stackoverflow.com/questions/3599670/ajax-file-download-using-jquery-php
    //Trafalmadorian
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

function onEditClick()
{
    window.location.href = '/books/edit?id=' + id;
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