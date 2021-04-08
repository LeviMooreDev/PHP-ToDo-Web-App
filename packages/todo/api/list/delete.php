<?php
include "../core.php";

startEncryption();
$name = escape(encrypt(get("name")));
endEncryption();

Database::query("DELETE FROM `$table` WHERE `list`='$name'");

//this is a nasty hack to get auto refresh to work.
//when deleting a list we update a task which will trigger a refresh.
//need a better way to auto refresh when deleting.
startEncryption();
$userDeviceID = escape(encrypt(userDeviceID()));
endEncryption();
Database::query("UPDATE `$table` SET `updated_at` = CURRENT_TIMESTAMP, `updated_by`='$userDeviceID' LIMIT 1;");

API::success("Deleted");