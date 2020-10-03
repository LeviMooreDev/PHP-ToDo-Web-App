var content = $(".content");
var url = encodeURIComponent("http://books.levimoore.dk/packages/book-hub/api/download.php?id=" + getUrlParameter("id"));
content.html("");
content.append(`
    <iframe id="iframe" src="http://books.levimoore.dk/packages/book-hub/pdfjs/iframe.php?file=${url}"></iframe>
    `);

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