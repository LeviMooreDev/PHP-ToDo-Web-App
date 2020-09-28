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
}

function scan()
{
    //get uploaded files

    Alert.working(() =>
    {
        API.simple("book-hub", "repair/scan", "",
            function(result)
            {
                Alert.success("Scan complete");
                scanResults = [];
                var rowId = 0;
                result["missing-file"].forEach(item =>
                {
                    var arrayItem = [];
                    arrayItem["name"] = item["file"];
                    arrayItem["type"] = "Missing file. (Fix: remove entry)";
                    arrayItem["fix"] = `fixMissingFile(${rowId}, ${item["id"]})`;
                    arrayItem["rowId"] = rowId++;
                    scanResults.push(arrayItem);
                });
                result["missing-database-entry"].forEach(item =>
                {
                    var arrayItem = [];
                    arrayItem["name"] = item;
                    arrayItem["type"] = "Missing database entry. (Fix: add entry)";
                    arrayItem["fix"] = `fixMissingDatabaseEntry(${rowId}, '${item}')`;
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
        eval(item["fix"]);
    });
}

function updateList()
{
    scanResults.sort(
        function(a, b)
        {
            if (a["name"].toLowerCase() < b["name"].toLowerCase()) return -1;
            if (a["name"].toLowerCase() > b["name"].toLowerCase()) return 1;
            return 0;
        }
    );
    $("tbody").html("");
    scanResults.forEach(item =>
    {
        $("tbody").append(`
        <tr id="${item["rowId"]}">
            <td>
                ${item["name"]}
            </td>
            <td>
                ${item["type"]}
            </td>
            <td class="button-col">
                <button class="btn btn-primary" data-toggle="tooltip" title="Fix" onClick="${item["fix"]}">
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

function fixMissingFile(rowId, id)
{
    var data = {
        id: id
    };
    API.simple("book-hub", "repair/fix-missing-file", data,
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
        function(result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}

function fixMissingDatabaseEntry(rowId, name)
{
    var data = {
        file: name
    };
    API.simple("book-hub", "repair/fix-database-entry", data,
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
        function(result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
            console.log(result);
        }
    );
}