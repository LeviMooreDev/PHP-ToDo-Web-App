<?php
header('Content-Type: application/json');
include("../core.php");

$files = array_diff(scandir(Core::uploadFolder()), array('..', '.'));
sort($files);
Core::result("files", $files);
Core::success("Successful");