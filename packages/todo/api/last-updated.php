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

//get priority
$by = "";
if(isset($_POST["by"])){
	$by = Database::escape($_POST["by"]);
}

//query
$result = Database::query("SELECT `updated_at` FROM `$table` WHERE NOT `updated_by`= '$by' ORDER BY `updated_at` DESC LIMIT 1");

if ($result->num_rows > 0)
{
    while ($row = $result->fetch_assoc())
    {
		API::result("updated_at", $row["updated_at"]);
    }
}
API::success("");