<?php
//session
if (session_status() != PHP_SESSION_ACTIVE) {
    session_start();
}

//database
$databaseConfigFile = $_SERVER['DOCUMENT_ROOT'] . "/database-config.php";
include_once($_SERVER['DOCUMENT_ROOT'] . "/database.php");

//current url
$url = substr(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), 1);
if (!isset($url) || empty($url)) {
    $url = "home";
}
$url = rtrim($url, "/");

//all urls
$urls = [];
$packages = getPackages();
foreach ($packages as &$package) {
    $file = getPackageURLs($package);
    if (file_exists($file)) {
        $newUrls = include($file);
        foreach ($newUrls as $key => $value) {
            //$newUrls[$key] = getPackageWebsiteBase($package) . "/pages/" . $value;
            $newUrls[$key] = ["package" => $package, "page" => $value];
        }
        $urls = array_merge($newUrls, $urls);
    }
}

//package functions
foreach ($packages as &$package) {
    $file = getPackageFunctions($package);
    if (file_exists($file)) {
        include $file;
    }
}

//built in functions 
function getPackages()
{
    return include($_SERVER['DOCUMENT_ROOT'] . "/packages.php");
}
function getPackageServerBase($package)
{
    return $_SERVER['DOCUMENT_ROOT'] . "/packages/$package";
}
function getPackageWebsiteBase($package)
{
    return "/packages/$package";
}

function getGlobalPHPFile($package)
{
    global $page;
    $file = getPackageServerBase($package) . "/global/code.php";
    if (file_exists($file)) {
        return $file;
    }
    return null;
}
function getGlobalHeaderFile($package)
{
    $fileHTML = getPackageServerBase($package) . "/global/head.html";
    $filePHP = getPackageServerBase($package) . "/global/head.php";
    if (file_exists($fileHTML)) {
        return $fileHTML;
    } else if (file_exists($filePHP)) {
        return $filePHP;
    }
    return null;
}
function getGlobalBeforeContentFile($package)
{
    $fileHTML = getPackageServerBase($package) . "/global/before-content.html";
    $filePHP = getPackageServerBase($package) . "/global/before-content.php";
    if (file_exists($fileHTML)) {
        return $fileHTML;
    } else if (file_exists($filePHP)) {
        return $filePHP;
    }
    return null;
}
function getGlobalAfterContentFile($package)
{
    $fileHTML = getPackageServerBase($package) . "/global/after-content.html";
    $filePHP = getPackageServerBase($package) . "/global/after-content.php";
    if (file_exists($fileHTML)) {
        return $fileHTML;
    } else if (file_exists($filePHP)) {
        return $filePHP;
    }
    return null;
}
function getGlobalScriptFile($package)
{
    $fileHTML = getPackageServerBase($package) . "/global/scripts.html";
    $filePHP = getPackageServerBase($package) . "/global/scripts.php";
    if (file_exists($fileHTML)) {
        return $fileHTML;
    } else if (file_exists($filePHP)) {
        return $filePHP;
    }
    return null;
}

function getPackageFunctions($package)
{
    $file = getPackageServerBase($package) . "/functions.php";
    if (file_exists($file)) {
        return $file;
    }
    return null;
}
function getPackageConfigurable($package)
{
    $file = getPackageServerBase($package) . "/configurable.php";
    if (file_exists($file)) {
        return $file;
    }
    return null;
}
function getPackageURLs($package)
{
    $file = getPackageServerBase($package) . "/pages/urls.php";
    if (file_exists($file)) {
        return $file;
    }
    return null;
}

function getPageServerBase($url)
{
    global $urls;
    return getPackageServerBase($urls[$url]["package"]) . "/pages/" . $urls[$url]["page"];
}
function getPageWebsiteBase($url)
{
    global $urls;
    return getPackageWebsiteBase($urls[$url]["package"]) . "/pages/" . $urls[$url]["page"];
}

function getPageConfigFileFromURL($url)
{
    $file = getPageServerBase($url) . "/config.php";
    if (file_exists($file)) {
        return $file;
    }
    return null;
}
function getPageCSSFileFromURL($url)
{
    $file = getPageServerBase($url) . "/style.css";
    if (file_exists($file)) {
        return $file;
    }
    return null;
}
function getPageCSSFileHTMLFromURL($url)
{
    $file = getPageServerBase($url) . "/style.css";
    if (file_exists($file)) {
        return getPageWebsiteBase($url) . "/style.css";
    }
    return "";
}
function getPageContentFileFromURL($url)
{
    global $urls;
    $fileHTML = getPageServerBase($url) . "/content.html";
    $filePHP = getPageServerBase($url) . "/content.php";
    //print_r($urls);
    //echo $fileHTML;
    if (file_exists($fileHTML)) {
        return $fileHTML;
    } else if (file_exists($filePHP)) {
        return $filePHP;
    }
    return null;
}
function getPageScriptFileFromURL($url)
{
    $file = getPageServerBase($url) . "/code.js";
    if (file_exists($file)) {
        return $file;
    }
    return null;
}
function getPageScriptFileHTMLFromURL($url)
{
    $file = getPageServerBase($url) . "/code.js";
    if (file_exists($file)) {
        return getPageWebsiteBase($url) . "/code.js";
    }
    return null;
}
function getPagePHPFileFromURL($url)
{
    $file = getPageServerBase($url) . "/code.php";
    if (file_exists($file)) {
        return $file;
    }
    return null;
}