$(document).ready(function()
{
    $("#form").on('submit', function(e)
    {
        e.preventDefault();
        submit();
    });

    $('#files').on('change', function()
    {
        filesSelectUpdate();
    });

    ready();
});

function ready()
{
    //reset progress bar
    $("#progress-bar").width('0%');
    $("#progress-bar").html('0%');

    //add already uploaded files to list
    uploadedServerList.forEach(item =>
    {
        addUploadedFileToList(item);
    });
    sortUploadedFilesList();
}

function submit()
{
    var progress = $("#progress-bar");
    var files = $('#files').get(0).files;
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

    //call upload api
    API.upload("book-hub", "add/upload", data, progress,
        function(result)
        {
            //if successful
            if (result["success"] == true)
            {
                Alert.success(result["message"]);

                //add uploaded files to table
                result["uploaded"].forEach(item =>
                {
                    addUploadedFileToList(item);
                });
                sortUploadedFilesList();

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
}

function filesSelectUpdate()
{
    var files = $('#files').get(0).files;
    var count = files.length;

    //check for unsupported files
    var supportedFormat = ['pdf'];
    for (var i = 0; i < count; i++)
    {
        var type = files[i]["name"].split('.').pop();
        if ($.inArray(type, supportedFormat) < 0)
        {
            Alert.error("Format " + type + " not supported. Use " + supportedFormat.join(', '));
            clearForm();
            return;
        }
    }

    //file size
    var totalSize = 0;
    var maxMB = 100;
    for (var i = 0; i < count; i++)
    {
        totalSize += files[i]["size"];
    }
    if (totalSize > 1048576 * maxMB)
    {
        Alert.error("Files are too big. Can only upload a combined " + maxMB + "MB");
        clearForm();
    }
}

function addUploadedFileToList(name)
{
    $("#uploadedFiles tbody").append(`
    <tr>
        <td>
            ${name.split('\\').pop()}
        </td>
        <td>
            <button class="btn btn-danger" onClick="remove(this, '${name}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    </tr>
    `);
}

function sortUploadedFilesList()
{
    var tbody = $("#uploadedFiles tbody");
    tbody.find('tr').sort(function(a, b)
    {
        return $('td:first', a).text().localeCompare($('td:first', b).text());
    }).appendTo(tbody);
}

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

function remove(listElement, name)
{
    var data = {
        name: name
    };
    API.simple("book-hub", "add/delete", data,
        function (result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);
                $(listElement).parent().parent().remove();
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function (result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            Alert.error(result["message"]);
        }
    );
}