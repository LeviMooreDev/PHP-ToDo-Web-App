<?php
$pageExist = false;
foreach (Routing::all() as $key => $value)
{
    if ($key === Routing::url())
    {
        $pageExist = true;
        break;
    }
}
if ($pageExist === false)
{
    header("Location: /_404");
    die();
}