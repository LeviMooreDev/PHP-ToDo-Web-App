<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

if (isset($_POST["title"]))
{
}
else
{
    $return["result"]["success"] = false;
    $return["result"]["message"] = "Title data is missing";
}



$return["status"] = "OK";
exit(json_encode($return));