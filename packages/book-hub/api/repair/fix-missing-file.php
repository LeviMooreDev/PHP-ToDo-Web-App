<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();
Database::connect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

if (isset($_POST["id"]))
{
    $id = Database::escape($_POST["id"]);
    
    $result = Database::query("SELECT * FROM `book-hub` WHERE `id`=" . $id);
    if ($result->num_rows === 1)
    {
        Database::query("DELETE FROM `book-hub` WHERE `id`=" . $id);
        $return["result"]["success"] = true;
        $return["result"]["message"] = "Fix successful";
    }
    else
    {
        $return["result"]["success"] = false;
        $return["result"]["message"] = "No entry for file exists";
    }
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "Id data is missing";
}

$return["status"] = "OK";
exit(json_encode($return));