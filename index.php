<?php
include($_SERVER['DOCUMENT_ROOT'] . "/core.php");

$config = [
    'database' => true
];
foreach ($packages as &$package) {
    $file = getPackageConfigurable($package);
    if (file_exists($file)) {
        $config = array_merge($config, include($file));
    }
}

$configFile = getPageConfigFileFromURL($url);
if (isset($configFile)) {
    $config = array_merge($config, include($configFile));
}

foreach ($packages as &$item) {
    $file = getGlobalPHPFile($item);
    if (isset($file)) {
        include_once($file);
    }
}

$phpCodeFile = getPagePHPFileFromURL($url);
if (isset($phpCodeFile)) {
    include_once($phpCodeFile);
}

?>
<html lang="en">

<head>
    <?php
    foreach ($packages as &$item) {
        $header = getGlobalHeaderFile($item);
        if (isset($header)) {
            include($header);
        }
    }
    if (getPageCSSFileFromURL($url) !== null) {
        echo '<link rel="stylesheet" type="text/css" href="' . getPageCSSFileHTMLFromURL($url) . '">';
    }

    ?>
</head>

<body>
    <?php

    foreach ($packages as &$package) {
        $beforeContentFile = getGlobalBeforeContentFile($package);
        if (isset($beforeContentFile)) {
            include($beforeContentFile);
        }
    }
    $contentFile = getPageContentFileFromURL($url);
    if (isset($contentFile)) {
        include($contentFile);
    }
    foreach ($packages as &$package) {
        $afterContentFile = getGlobalAfterContentFile($package);
        if (isset($afterContentFile)) {
            include($afterContentFile);
        }
    }

    foreach ($packages as &$item) {
        $script = getGlobalScriptFile($item);
        if (isset($script)) {
            include($script);
        }
    }
    if (getPageScriptFileFromURL($url) !== null) {
        echo '<script src="' . getPageScriptFileHTMLFromURL($url) . '"></script>';
    }
    ?>
</body>
</html>
<?php