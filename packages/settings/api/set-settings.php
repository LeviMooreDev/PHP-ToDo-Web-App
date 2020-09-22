<?php
include_once($_SERVER['DOCUMENT_ROOT'] . "/core.php");
connect();

if (!authCheck()) {
    die();
}

$reset = validatePOST("reset", false);

if (isset($reset) && $reset == "all") {
    queryFile("reset-settings");
} else {
    foreach ($_POST as $name => $value) {
        $name = escape($name);
        $value = escape($value);
        query("UPDATE `settings` SET `value`='$value' WHERE `name`='$name'");
    }
}
$_SESSION["cached-settings"] = false;

$return["status"] = "OK";
exit(json_encode($return));
