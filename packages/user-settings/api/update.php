<?php
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

if (Packages::exist("authentication"))
{
    if (!Authentication::Auth())
    {
        die();
    }
}

Database::connect();

foreach ($_POST as $id => $value)
{
    $id = Database::escape($id);
    $value = Database::escape($value);
    Database::query("UPDATE `user-settings` SET `value`='$value' WHERE `id`='$id'");
}

$return["status"] = "OK";
exit(json_encode($return));
