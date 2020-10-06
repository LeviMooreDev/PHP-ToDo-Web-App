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
                scanResults = result["issues"];
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


function updateList()
{
    scanResults.sort(
        function(a, b)
        {
            if (a["fix-description"].toLowerCase() < b["fix-description"].toLowerCase()) return -1;
            if (a["fix-description"].toLowerCase() > b["fix-description"].toLowerCase()) return 1;
            return 0;
        }
    );
    $("tbody").html("");
    scanResults.forEach(item =>
    {
        $("tbody").append(`
        <tr id="entry-${item["entryID"]}">
            <td>
                ${item["issues-description"]}
            </td>
            <td>
                ${item["fix-description"]}
            </td>
            <td class="button-col">
                <button class="btn btn-primary" data-toggle="tooltip" title="Fix" onClick="fix(${item["entryID"]})">
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

function fixAll()
{
    scanResults.forEach(item =>
    {
        fix(item["entryID"]);
    });
}
function fix(entryId)
{
    var entry = scanResults.find(entry => entry["entryID"] == entryId);
    var endpoint = entry["fix-endpoint"];
    var data = entry["fix-data"];
    
    API.simple("book-hub", "repair/" + endpoint, JSON.parse(data),
        function(result)
        {
            if (result["success"] == true)
            {
                Alert.success(result["message"]);
                removeRow(entryId);
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

function removeRow(entryId)
{
    $(`#entry-${entryId}`).remove();
    scanResults = scanResults.filter(entry => entry["entryID"] != entryId);
}