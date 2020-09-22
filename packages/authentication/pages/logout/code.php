<?php
include_once($_SERVER['DOCUMENT_ROOT'] . "/core.php");
connect();
$_SESSION["logged_in"] = false;

if (isset($_COOKIE["authentication-remember-key"]))
{
    $hashed = hash("sha256", $_COOKIE["authentication-remember-key"]);
    setcookie("authentication-remember-key", "", time() - 3600); 
    query("DELETE FROM `authentication_remember_keys` WHERE `key_`='$hashed'");
}

header("Location: /");