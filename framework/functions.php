<?php
class Functions
{
    private const FUNCTIONS_FILE_NAME = 'functions.php';
    private const GLOBAL_FILE_NAME = 'global.php';

    public static function collect() : void
    {
        $packages = Packages::all();

        foreach ($packages as &$package)
        {
            $file = Packages::serverPath($package) . "/" . Functions::FUNCTIONS_FILE_NAME;
            if (file_exists($file))
            {
                include $file;
            }
        }
    }

    public static function global() : void
    {
        $packages = Packages::all();

        foreach ($packages as &$package)
        {
            $file = Packages::serverPath($package) . "/" . Functions::GLOBAL_FILE_NAME;
            if (file_exists($file))
            {
                include_once($file);
            }
        }
    }
}