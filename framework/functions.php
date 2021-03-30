<?php
class Functions
{
    private const FUNCTIONS_FILE_NAME = 'functions.php';
    private const START_FILE_NAME = 'start.php';

    public static function collect(): void
    {
        $packages = Packages::names();

        foreach ($packages as &$package)
        {
            $file = Packages::serverPath($package) . "/" . Functions::FUNCTIONS_FILE_NAME;
            if (file_exists($file))
            {
                include $file;
            }
        }
    }

    public static function start (): void
    {
        $packages = Packages::names();

        foreach ($packages as &$package)
        {
            $file = Packages::serverPath($package) . "/" . Functions::START_FILE_NAME;
            if (file_exists($file))
            {
                include_once($file);
            }
        }
    }
}