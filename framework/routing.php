<?php
class Routing
{
    private const ROUTING_FILE_NAME = 'routing.php';

    private static ?string $_url = null;
    public static function url(): string
    {
        if (Routing::$_url === null)
        {
            Routing::$_url = substr(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), 1);

            if (!isset(Routing::$_url) || empty(Routing::$_url))
            {
                Routing::$_url = "home";
            }

            Routing::$_url = rtrim(Routing::$_url, "/");
        }

        return Routing::$_url;
    }

    private static ?array $_all = null;
    public static function all(): array
    {
        if (Routing::$_all === null)
        {
            Routing::$_all = [];
            $packages = Packages::names();

            foreach ($packages as &$package)
            {
                $routingFile = Packages::serverPath($package) . "/" . Routing::ROUTING_FILE_NAME;
                if (file_exists($routingFile))
                {
                    $routing = include($routingFile);
                    foreach ($routing as $key => $value)
                    {
                        $routing[$key] = ["package" => $package, "page" => $value];
                    }
                    Routing::$_all = array_merge($routing, Routing::$_all);
                }
            }
        }

        return Routing::$_all;
    }
}