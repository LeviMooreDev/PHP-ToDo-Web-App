<?php
foreach (glob($_SERVER['DOCUMENT_ROOT'] . "/framework/*.php") as $filename)
{ 
    include $filename; 
}