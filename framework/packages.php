<?php
class Packages
{
    private const DEPENDENCIES_FILE_NAME = 'dependencies.php';
    private const VERSION_FILE_NAME = 'version.php';

    private static ?array $_packages = null;
    private static ?array $_names = null;
    private static ?array $_versions = null;

    public static function all(): array
    {
        if (Packages::$_packages === null)
        {
            Packages::$_packages = include($_SERVER['DOCUMENT_ROOT'] . "/packages.php");
        }

        return Packages::$_packages;
    }
    public static function names(): array
    {
        if (Packages::$_names === null)
        {
            Packages::$_names = [];
            foreach (Packages::all() as $name => $version)
            {
                Packages::$_names[] = $name;
            }
        }

        return Packages::$_names;
    }
    public static function version($_names): string
    {
        if (Packages::$_versions === null)
        {
            Packages::$_versions = [];
            foreach (Packages::all() as $name => $version)
            {
                array_push(Packages::$_versions, $version);
            }
        }

        return Packages::$_versions[$name];
    }


    public static function serverPath($name): string
    {
        return $_SERVER['DOCUMENT_ROOT'] . "/packages/$name";
    }
    public static function httpPath($name): string
    {
        return "/packages/$name";
    }

    public static function exist($name)
    {
        return in_array($name, Packages::names());
    }

    public static function validate(): void
    {
        Packages::validateInstall();
        Packages::validateVersion();
        Packages::validateDependencies();
    }
    private static function validateInstall(): void
    {
        $packages = Packages::all();

        foreach ($packages as $name => $version)
        {
            $file = Packages::serverPath($name);
            if (!file_exists($file))
            {
                die("Package $name is missing.");
            }
        }
    }
    private static function validateVersion(): void
    {
        $packages = Packages::all();

        foreach ($packages as $name => $version)
        {
            $file = Packages::serverPath($name) . "/" . Packages::VERSION_FILE_NAME;
            if (file_exists($file))
            {
                $installVersion = include($file);
                if ($installVersion !== $version)
                {
                    die("Package $name version $version is required, but version $installVersion is installed.");
                }
            }
            else
            {
                die("Package $name version file is missing.");
            }
        }
    }
    public static function validateDependencies(): void
    {
        $packages = Packages::all();

        foreach ($packages as $pName => $pVersion)
        {
            $file = Packages::serverPath($pName) . "/" . Packages::DEPENDENCIES_FILE_NAME;
            if (file_exists($file))
            {
                $dependencies = include($file);
                foreach ($dependencies as $dName => $dVersion)
                {
                    if (Packages::exist($dName))
                    {
                        if($packages[$pName] !== $dVersion)
                        {
                            $installVersion = $packages[$pName];
                            die("Package $pName has $dName version $dVersion as a dependency but version $installVersion is installed.");
                        }
                    }
                    else
                    {
                        die("Package $pName has $dName version $dVersion as a dependency but it is missing.");
                    }
                }
            }
        }
    }
}