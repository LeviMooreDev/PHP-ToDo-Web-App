function scan()
{
    console.log(1);
}

$(document).ready(function()
{
    $("#form").on('submit', function(e)
    {
        e.preventDefault();

        var progress = $("#progress-bar");
        var files = $('#files').get(0).files;
        var count = files.length;

        //check if no files are selected
        if (count === 0)
        {
            Alert.error("No file selected.");
            return;
        }

        //check for unsupported files
        var supportedFormat = ['pdf'];
        for (var i = 0; i < count; i++)
        {
            var type = files[i]["name"].split('.').pop();
            if ($.inArray(type, supportedFormat) < 0)
            {
                Alert.error("Format " + type + " not supported. Use " + supportedFormat.join(', '));
                return;
            }
        }

        //prepare data
        var data = new FormData();
        for (var i = 0; i < count; i++)
        {
            data.append("files[]", files[i]);
        }
        
        //call upload api
        API.upload("book-hub", "upload", data, progress,
            function(result)
            {
                //if successful
                if (result["success"] == true)
                {
                    Alert.success(result["message"]);
                    
                    //add uploaded files to table
                    result["uploaded"].forEach(element =>
                    {
                        var filename = element.split('\\').pop();
                        var tbody = $("#uploadedFiles tbody");
                        //add
                        tbody.append("<tr><td>" + filename + "</td></tr>");
                        //sort
                        tbody.find('tr').sort(function(a, b)
                        {
                            return $('td:first', a).text().localeCompare($('td:first', b).text());
                        }).appendTo(tbody);
                    });

                    enableForm();
                    clearForm();
                }
                //if unsuccessful
                else if (result["success"] == false)
                {
                    Alert.error(result["message"]);
                    enableForm();
                    clearForm();
                }
            },
            function(result) //failed
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
                enableForm();
                clearForm();
            }
        );

        disableForm();
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


    function disableForm()
    {
        $('#submit').attr("disabled", "disabled");
        $('#files').attr("disabled", "disabled");
    }
    function enableForm()
    {
        $('#submit').removeAttr("disabled");
        $('#files').removeAttr("disabled");
    }
    function clearForm()
    {
        $('#files').val(null);
    }
});