<?php
include "../core.php";

startEncryption();
$new = escape(encrypt(get("new")));
$old = escape(encrypt(get("old")));
$userDeviceID = escape(encrypt(userDeviceID()));
endEncryption();

Database::query("UPDATE `$table` SET `list`='$new', `updated_by`='$userDeviceID' WHERE `list`='$old'");

API::success("Updated");

