<?php
class Asuggest
{
    static function AddScript()
    {
        echo "<script src='" . Packages::selfHttpPath() . "/static/jquery.a-tools-1.4.1.js'></script>";
        echo "<script src='" . Packages::selfHttpPath() . "/static/jquery.asuggest.js'></script>";
    }
}