<?php
//set json header
header('Content-Type: application/json');

//include framework
include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

//check that the user is logged in
Authentication::Auth403();

//connect to database
Database::connect();

//get table name
$table = Database::tableName("tasks");

//check if we have an id to update
if (!isset($_POST["id"]))
{
	API::fail("missing id");
}
//get id
$id = Database::escape($_POST["id"]);

//query
Database::query("DELETE FROM `$table` WHERE `id`=$id");

//return
API::success("Deleted");

