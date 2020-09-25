<?php
class Requirements
{
    private const REQUIREMENTS_FILE_NAME = 'requirements.php';

    public static function validate() : void
    {
        $packages = Packages::all();

        foreach ($packages as &$package)
        {
            $file = Packages::serverPath($package) . "/" . Requirements::REQUIREMENTS_FILE_NAME;
            if (file_exists($file))
            {
                $requirements = include($file);
                foreach ($requirements as &$requirement)
                {
                    if (!in_array($requirement, $packages))
                    {
                        die("Package '$requirement' is required by '$package'.");   
                    }
                }
            }
        }
    }
}