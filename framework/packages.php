<?php
class Packages
{
    private static ?array $_all = null;
    public static function all(): array
    {
        if (Packages::$_all === null)
        {
            Packages::$_all = include($_SERVER['DOCUMENT_ROOT'] . "/packages.php");
        }

        return Packages::$_all;
    }

    public static function serverPath($name): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . "/packages/$name";
    }
    public static function httpPath($name): string
    {
        return "/packages/$name";
    }

    public static function validate(): void
    {
        $packages = Packages::all();

        foreach ($packages as &$package)
        {
            $file = Packages::serverPath($package);
            if (!file_exists($file))
            {
                die("Package '$package' is missing.");
            }
        }
    }
}