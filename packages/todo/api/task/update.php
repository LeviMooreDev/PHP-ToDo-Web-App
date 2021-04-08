<?php
include "../core.php";

//contains update part of the sql
$updateSql = [];

$id = escape(get("id"));

//start encryption
startEncryption();

//get name
if(isset($_POST["name"])){
	$updateSql[] = "`name`='" . escape(encrypt(get("name"))) . "'";
}

//get description
if(isset($_POST["description"])){
	$updateSql[] = "`description`='" . escape(encrypt(get("description"))) . "'";
}

//get list
if(isset($_POST["list"])){
	$updateSql[] = "`list`='" . escape(encrypt(get("list"))) . "'";
}

//user device id
$userDeviceID = escape(encrypt(userDeviceID()));
$updateSql[] = "`updated_by`='" . $userDeviceID ."'";

//stop encryption
endEncryption();

//get done
if(isset($_POST["done"])){
	$updateSql[] = "`done`=" . escape(get("done"));
}

//get priority
if(isset($_POST["priority"])){
	$updateSql[] = "`priority`=" . escape(get("priority"));
}

//get date
if(isset($_POST["date"])){
	//if there is no date set it to null
	if($_POST["date"] == ""){
		$updateSql[] = "`date`=null";
	}
	else{
		$updateSql[] = "`date`='" . escape(get("date")) . "'";
	}
}


//join list of update sql into sql string
$updateSql = join(", ", $updateSql);

Database::query("UPDATE `$table` SET $updateSql WHERE `id`=$id");
API::success("Updated");