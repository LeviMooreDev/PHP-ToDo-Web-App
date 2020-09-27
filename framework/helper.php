<?php
class Helper
{
    static function escapeFileName($name): string
    {
        return preg_replace('/[^A-Za-z0-9_\-. ]/', '_', $name);
    }
}