<?php
class BootstrapSelect
{
    static function AddCSS()
    {
        $file = Packages::httpPath("bootstrap-select") . "/files/bootstrap-select.min.css";
        echo "<link rel='stylesheet' href='$file'>";
    }
    static function AddScript()
    {
        $file = Packages::httpPath("bootstrap-select") . "/files/bootstrap-select.min.js";
        echo "<script src='$file'></script>";
    }
}