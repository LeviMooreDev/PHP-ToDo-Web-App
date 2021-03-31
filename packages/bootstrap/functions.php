<?php
class Bootstrap
{
    static function AddCSS()
    {
        $bootstrap = Packages::selfHttpPath() . "/static/bootstrap.min.css";
        echo "<link rel='stylesheet' href='$bootstrap'>";
    }
    static function AddScript()
    {
        $bootstrap = Packages::selfHttpPath() . "/static/bootstrap.min.js";
        $popper = Packages::selfHttpPath() . "/static/popper.min.js";
        echo "<script src='$popper'></script>";
        echo "<script src='$bootstrap'></script>";
    }
}