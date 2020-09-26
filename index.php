<?php
if (session_status() != PHP_SESSION_ACTIVE)
{
    session_start();
}

include($_SERVER['DOCUMENT_ROOT'] . "/framework.php");
Packages::validate();
Functions::collect();
Functions::global ();
Page::build();