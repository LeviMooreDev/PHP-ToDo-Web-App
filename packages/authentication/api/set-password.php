<?php
header('Content-Type: application/json');

include_once($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();
Database::connect();

$result = Database::query("SELECT * FROM `authentication` LIMIT 1");
if ($result->num_rows === 0)
{
    $password = Database::validatePOST("password");
    $confirm = Database::validatePOST("confirm");

    if($password === null || strlen($password) < 1)
    {
        $return["result"]["error"] = "Password missing.";
    }
    else if($confirm === null || strlen($confirm) < 1)
    {
        $return["result"]["error"] = "Password missing.";
    }
    else if($password !== $confirm)
    {
        $return["result"]["error"] = "Passwords does not match.";
    }
    else
    {
        $hashPassword = password_hash($password, PASSWORD_DEFAULT);
        Database::query("INSERT INTO `authentication`(`password`) VALUES ('$hashPassword')");
        $return["result"]["success"] = true;
    }
}
else
{
    Authentication::RegisterFail(0);
    $return["result"]["error"] = "Password already exist.";
}
$return["status"] = "OK";
exit(json_encode($return));
