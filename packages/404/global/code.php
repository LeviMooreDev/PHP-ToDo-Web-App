<?php
$pageExist = false;
foreach($urls as $key => $value){
    if($key === $url)
    {
        $pageExist = true;
        break;
    }
}
if ($pageExist === false) {
    header("Location: /_404");
    die();
}