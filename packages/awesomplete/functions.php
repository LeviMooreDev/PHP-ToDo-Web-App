<?php
class Awesomplete
{
    static function AddCSS()
    {
        $file = Packages::selfHttpPath() . "/static/awesomplete.css";
        echo "<link rel='stylesheet' href='$file'>";
    }
    static function AddScript()
    {
        $file = Packages::selfHttpPath() . "/static/awesomplete.min.js";
        echo "<script src='$file'></script>";
    }
}