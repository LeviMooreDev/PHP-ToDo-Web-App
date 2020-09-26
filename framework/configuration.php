<?php
class Configuration
{
    private const PACKAGE_CONFIG_FILE_NAME = 'configurable.php';
    private const PAGE_CONFIG_FILE_NAME = 'config.php';

    private static ?array $_default = null;
    private static function defaults(): array
    {
        if (Configuration::$_default === null)
        {
            Configuration::$_default = [];
            $packages = Packages::names();

            foreach ($packages as &$package)
            {
                $file = Packages::serverPath($package) . "/" . Configuration::PACKAGE_CONFIG_FILE_NAME;
                if (file_exists($file))
                {
                    Configuration::$_default = array_merge(Configuration::$_default, include($file));
                }
            }
        }

        return Configuration::$_default;
    }

    public static function get($name): bool
    {
        $file = Page::serverPath() . "/" . Configuration::PAGE_CONFIG_FILE_NAME;
        if (file_exists($file))
        {
            return array_merge(Configuration::defaults(), include($file))[$name];
        }
        else
        {
            return Configuration::defaults()[$name];
        }
    }
}