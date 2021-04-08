<?php
include "../core.php";

startEncryption();
$name = escape(encrypt(get("name")));
$description = escape(encrypt(get("description")));
$list = escape(encrypt(get("list")));
$userDeviceID = escape(encrypt(userDeviceID()));
endEncryption();

$priority = escape(get("priority"));
$date = "'" . escape(get("date")) . "'";
if($date == "''"){
	$date = "null";
}

Database::query("INSERT INTO `$table` (`priority`, `name`, `description`, `list`, `date`, `updated_by`) VALUES
									  ($priority, '$name','$description','$list', $date, '$userDeviceID')");

API::result("id", Database::insert_id());
API::success("Created");