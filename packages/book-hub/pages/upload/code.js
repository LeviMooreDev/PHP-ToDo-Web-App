var uploadedList = [];

$(document).ready(function()
{
    $("#form").on('submit', function(e)
    {
        e.preventDefault();
        upload();
    });

    $('#files').on('change', filesSelectUpdate);

    $('#commit-all').on('click', commitAll);

    ready();
});

function ready()
{
    $('[data-toggle="tooltip"]').tooltip();

    //reset progress bar
    $("#progress-bar").width('0%');
    $("#progress-bar").html('0%');

    //get uploaded files
    API.simple("book-hub", "upload/list", "",
        function(result)
        {
            if (result["success"] == true)
            {
                uploadedList = result["files"];
                updateList();
            }
            else if (result["success"] == false)
            {
                Alert.error("Unable to get list of uploaded files");
            }
        },
        function(result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}

function upload()
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
    API.upload("book-hub", "upload/upload", data, progress,
        function(result)
        {
            //if successful
            if (result["success"] == true)
            {
                Alert.success(result["message"]);

                //add uploaded files to table
                result["uploaded"].forEach(item =>
                {
                    uploadedList.push(item);
                });
                updateList();

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

function commit(name, goToEdit)
{
    var data = {
        name: name
    };
    API.simple("book-hub", "upload/commit", data,
        function(result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);

                var index = uploadedList.indexOf(name);
                uploadedList.splice(index, 1);
                updateList();
                if (goToEdit)
                {
                    window.open("/books/edit?id=" + result["id"], '_blank');
                }
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function(result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            Alert.error(result["message"]);
        }
    );
}

function commitAll()
{
    uploadedList.forEach(name =>
    {
        commit(name);
    });
}

function remove(name)
{
    var data = {
        name: name
    };
    API.simple("book-hub", "upload/delete", data,
        function(result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);

                var index = uploadedList.indexOf(name);
                uploadedList.splice(index, 1);
                updateList();
            }
            else if (result["success"] == false)
            {
                Alert.error(result["message"]);
            }
        },
        function(result)
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            Alert.error(result["message"]);
        }
    );
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

function updateList()
{
    uploadedList.sort(
        function(a, b)
        {
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
            return 0;
        }
    );
    $("#uploadedFiles tbody").html("");
    uploadedList.forEach(name =>
    {
        $("#uploadedFiles tbody").append(`
        <tr>
            <td>
                ${name.split('\\').pop()}
            </td>
            <td class="button-col">
                <button class="btn btn-primary" data-toggle="tooltip" title="Commit" onClick="commit('${name}', false)">
                    <i class="fas fa-plus"></i>
                </button>
            </td>
            <td class="button-col">
                <button class="btn btn-primary" data-toggle="tooltip" title="Commit and edit" onClick="commit('${name}', true)">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td class="button-col">
                <button class="btn btn-danger" data-toggle="tooltip" title="Delete" onClick="remove('${name}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
        `);
    });

    if (uploadedList.length == 0)
    {
        $('#commit-all').attr("disabled", "disabled");
    }
    else
    {
        $('#commit-all').removeAttr("disabled");
    }
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