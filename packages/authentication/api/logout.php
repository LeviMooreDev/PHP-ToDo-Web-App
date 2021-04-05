<?php
include_once($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
if (session_status() != PHP_SESSION_ACTIVE)
{
    session_start();
}
$_SESSION["authentication_logged_in"] = false;