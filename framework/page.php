<?php
class Page
{
    private const HEADER_FILE_NAMES = ['head.html', 'head.php'];
    private const BEFORE_CONTENT_FILE_NAMES = ['before-content.html', 'before-content.php'];
    private const AFTER_CONTENT_FILE_NAMES = ['after-content.html', 'after-content.php'];
    private const SCRIPTS_FILE_NAMES = ['scripts.html', 'scripts.php'];
    private const CONTENT_FILE_NAMES = ['content.html', 'content.php'];
    private const STYLE_FILE_NAME = 'style.css';
    private const CODE_FILE_NAME = 'code.js';
    
    public static function build()
    {
?>
        <html lang="en">
        <head>
<?php
        //global head
        foreach (Packages::names() as &$package)
        {
            foreach (Page::HEADER_FILE_NAMES as &$fileName)
            {

                $filePath = Packages::serverPath($package) . "/" . $fileName;
                if (file_exists($filePath))
                {
                    include($filePath);
                }
            }
        }
        //head
        foreach (Page::HEADER_FILE_NAMES as &$fileName)
        {
            $filePath = Page::serverPath() . "/" . $fileName;
            if (file_exists($filePath))
            {
                include($filePath);
            }
        }

        //style
        if (file_exists(Page::serverPath() . "/" . Page::STYLE_FILE_NAME))
        {
            echo '<link rel="stylesheet" type="text/css" href="' . Page::httpPath() . '/' . Page::STYLE_FILE_NAME . '">';
        }
?>
        </head>
        <body>
<?php
        //before content
        foreach (Packages::names() as &$package)
        {
            foreach (Page::BEFORE_CONTENT_FILE_NAMES as &$fileName)
            {
                $filePath = Packages::serverPath($package) . "/" . $fileName;
                if (file_exists($filePath))
                {
                    include($filePath);
                }
            }
        }

        //content
        foreach (Page::CONTENT_FILE_NAMES as &$fileName)
        {
            $filePath = Page::serverPath() . "/" . $fileName;
            if (file_exists($filePath))
            {
                include($filePath);
            }
        }

        //after content
        foreach (Packages::names() as &$package)
        {
            foreach (Page::AFTER_CONTENT_FILE_NAMES as &$fileName)
            {
                $filePath = Packages::serverPath($package) . "/" . $fileName;
                if (file_exists($filePath))
                {
                    include($filePath);
                }
            }
        }

        //global scripts
        foreach (Packages::names() as &$package)
        {
            foreach (Page::SCRIPTS_FILE_NAMES as &$fileName)
            {
                $filePath = Packages::serverPath($package) . "/" . $fileName;
                if (file_exists($filePath))
                {
                    include($filePath);
                }
            }
        }

        //scripts
        foreach (Page::SCRIPTS_FILE_NAMES as &$fileName)
        {
            $filePath = Page::serverPath() . "/" . $fileName;
            if (file_exists($filePath))
            {
                include($filePath);
            }
        }
        if (file_exists(Page::serverPath() . "/" . Page::CODE_FILE_NAME))
        {
            echo '<script src="' . Page::httpPath() . '/' . Page::CODE_FILE_NAME . '"></script>';
        }
?>
        </body>
        </html>
<?php
    }

    public static function serverPath()
    {
        $route = Routing::all()[Routing::url()];
        return Packages::serverPath($route["package"]) . "/" . $route["page"];
    }
    public static function httpPath()
    {
        $route = Routing::all()[Routing::url()];
        return Packages::httpPath($route["package"]) . "/" . $route["page"];
    }
}