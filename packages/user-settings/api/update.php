<?php
header('Content-Type: application/json');

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    Authentication::Auth403();
}

Database::connect();

foreach ($_POST as $id => $value)
{
    $id = Database::escape($id);
    $selected = Database::escape($value);
    Database::query("UPDATE `user-settings` SET `selected`='$selected' WHERE `id`='$id'");
}

$return["status"] = "OK";
exit(json_encode($return));
