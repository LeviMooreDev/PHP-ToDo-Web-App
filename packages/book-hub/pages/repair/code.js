var scanResults = [];

$(document).ready(function()
{
    $('#scan').on('click', scan);
    $('#fix-all').on('click', fixAll);

    ready();
});

function ready()
{
    $("#fix-all").attr("disabled", "disabled");
    scan();
}

function scan()
{
    Alert.working(() =>
    {
        API.simple("book-hub", "repair/scan", "",
            function(result)
            {
                Alert.success("Scan complete");
                scanResults = [];
                var rowId = 0;
                result["missing-folders"].forEach(item =>
                {
                    var arrayItem = [];
                    arrayItem["id"] = item["id"];
                    arrayItem["title"] = item["title"];
                    arrayItem["type"] = "Missing folder";
                    arrayItem["fix"] = "Remove database entry";
                    arrayItem["button"] = `deleteAll(${rowId}, ${item["id"]})`;
                    arrayItem["rowId"] = rowId++;
                    scanResults.push(arrayItem);
                });
                result["missing-books"].forEach(item =>
                {
                    var arrayItem = [];
                    arrayItem["id"] = item["id"];
                    arrayItem["title"] = item["title"];
                    arrayItem["type"] = "Missing book";
                    arrayItem["fix"] = "Remove database entry";
                    arrayItem["button"] = `deleteAll(${rowId}, ${item["id"]})`;
                    arrayItem["rowId"] = rowId++;
                    scanResults.push(arrayItem);
                });
                result["leftover-files"].forEach(item =>
                {
                    var arrayItem = [];
                    arrayItem["id"] = item["id"];
                    arrayItem["title"] = item["title"];
                    arrayItem["type"] = "Leftover files";
                    arrayItem["fix"] = "Remove files";
                    arrayItem["button"] = `deleteAll(${rowId}, ${item["id"]})`;
                    arrayItem["rowId"] = rowId++;
                    scanResults.push(arrayItem);
                });
                result["missing-database-entries"].forEach(item =>
                {
                    var arrayItem = [];
                    arrayItem["id"] = item["id"];
                    arrayItem["title"] = item["title"];
                    arrayItem["type"] = "Missing database entries";
                    arrayItem["fix"] = "Create database entry";
                    arrayItem["button"] = `createEntry(${rowId}, ${item["id"]}, '${item["title"]}')`;
                    arrayItem["rowId"] = rowId++;
                    scanResults.push(arrayItem);
                });
                updateList();
            },
            function(result) //failed
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
                console.log(result);
            }
        );
    });
}

function fixAll()
{
    scanResults.forEach(item =>
    {
        eval(item["button"]);
    });
}

function updateList()
{
    scanResults.sort(
        function(a, b)
        {
            if (a["title"].toLowerCase() < b["title"].toLowerCase()) return -1;
            if (a["title"].toLowerCase() > b["title"].toLowerCase()) return 1;
            return 0;
        }
    );
    $("tbody").html("");
    scanResults.forEach(item =>
    {
        $("tbody").append(`
        <tr id="${item["rowId"]}">
            <td>
                ${item["id"]}
            </td>
            <td>
                ${item["title"]}
            </td>
            <td>
                ${item["type"]}
            </td>
            <td>
                ${item["fix"]}
            </td>
            <td class="button-col">
                <button class="btn btn-primary" data-toggle="tooltip" title="Fix" onClick="${item["button"]}">
                    <i class="fas fa-hammer"></i>
                </button>
            </td>
        </tr>
        `);
    });

    if (scanResults.length == 0)
    {
        $('#fix-all').attr("disabled", "disabled");
    }
    else
    {
        $('#fix-all').removeAttr("disabled");
    }
}

function removeRow(rowId)
{
    $(`#${rowId}`).remove();
    scanResults = scanResults.filter(e => e["rowId"] !== rowId);
}

function deleteAll(rowId, id)
{
    var data = {
        id: id
    };
    API.simple("book-hub", "repair/delete-all", data,
        function(result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);
                removeRow(rowId);
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
            console.log(result);
        }
    );
}

function createEntry(rowId, id, title)
{
    var data = {
        id: id,
        title: title
    };
    API.simple("book-hub", "repair/create-entry", data,
        function(result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);
                removeRow(rowId);
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
            console.log(result);
        }
    );
}