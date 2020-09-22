<?php
include_once($_SERVER['DOCUMENT_ROOT'] . "/core.php");
connect();

foreach ($packages as &$package) {
    $file = getPackageServerBase($package) . "/settings.sql";
    if (file_exists($file)) {
        queryFile($file);
    }
}