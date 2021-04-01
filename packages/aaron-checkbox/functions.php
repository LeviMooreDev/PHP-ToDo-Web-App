<?php
class AaronCheckbox
{
    static function AddCSS()
    {
        $file = Packages::selfHttpPath() . "/static/aaron-checkbox.css";
        echo "<link rel='stylesheet' href='$file'>";
    }
}