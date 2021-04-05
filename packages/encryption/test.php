<?php
include_once($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Functions::collect();

Encryption::Start("test", "test");
$eData = Encryption::Encrypt("test", "test");
$data =  Encryption::Decrypt("test", $eData);
echo $data . "<br>";
Encryption::Stop();