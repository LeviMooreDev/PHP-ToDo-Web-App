$(document).ready(function ()
{
    var id = getUrlParameter("id");

    $("#pdf").attr("href", "/books/view/pdf?id=" + id);
    $("#epub").attr("href", "/books/view/epub?id=" + id);

    var data = {
        id: id,
    }
    API.simple("book-hub", "view/files", data,
        function (result)
        {
            if (result["success"] == true)
            {
                if(result["files"]["pdf"]){
                    $("#pdf").parent().show();
                }
                if(result["files"]["epub"]){
                    $("#epub").parent().show();
                }
                $("#edit").parent().show();
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