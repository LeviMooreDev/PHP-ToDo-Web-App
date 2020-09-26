function scan()
{
    console.log(1);
}

$(document).ready(function()
{
    $("#form").on('submit', function(e)
    {
        e.preventDefault();

        if ($(':file').get(0).files.length === 0)
        {
            Alert.error("No file selected.");
            return;
        }

        var data = new FormData(this);
        var progress = $("#progress-bar");
        API.upload("book-hub", "upload", data, progress,
            function(result)
            {
                if (result["success"] == true)
                {
                    Alert.success("File upload was a success.");
                    console.log(result["message"]);
                    $(':submit').removeAttr("disabled");
                    $(':file').removeAttr("disabled");

                    var filename = $('#file').val().split('\\').pop();
                    var tbody = $("#uploadedFiles tbody");
                    tbody.append("<tr><td>" + filename + "</td></tr>");
                    tbody.find('tr').sort(function(a, b)
                    {
                        return $('td:first', a).text().localeCompare($('td:first', b).text());
                    }).appendTo(tbody);
                    
                    $('#file').val(null);
                }
                else if (result["success"] == false)
                {
                    Alert.error(result["message"]);
                    console.log(result["message"]);
                    $(':submit').removeAttr("disabled");
                    $(':file').removeAttr("disabled");
                    $('#file').val(null);
                }
            },
            function(result) //failed
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
                $(':submit').removeAttr("disabled");
                $(':file').removeAttr("disabled");
                $('#file').val(null);
            }
        );

        $(':submit').attr("disabled", "disabled");
        $(':file').attr("disabled", "disabled");
    });

    $('#file').on('change', function()
    {
        var file = this.files[0];
        if (file.type != "application/pdf")
        {
            Alert.error("Only PDF files.");
            $('#file').val(null);
        }
    });

    $("#progress-bar").width('0%');
    $("#progress-bar").html('0%');
});