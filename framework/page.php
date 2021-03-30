<?php
class Page
{
    private const HTML_HEADER_FILE_NAMES = ['head.html', 'head.php'];
    private const HTML_BEFORE_CONTENT_FILE_NAMES = ['before-content.html', 'before-content.php'];
    private const HTML_AFTER_CONTENT_FILE_NAMES = ['after-content.html', 'after-content.php'];
    private const HTML_SCRIPTS_FILE_NAMES = ['scripts.html', 'scripts.php'];

    private const PAGE_CONTENT_FILE_NAMES = ['content.html', 'content.php'];
    private const PAGE_STYLE_FILE_NAME = 'style.css';
    private const PAGE_CODE_FILE_NAME = 'code.js';
    private const PAGE_HEAD_FILE_NAME = 'head.php';
    private const PAGE_SCRIPTS_FILE_NAME = 'scripts.php';
    
    public static function build()
    {
?>
        <html lang="en">
        <head>
<?php
        //html head
        foreach (Packages::names() as &$package)
        {
            foreach (Page::HTML_HEADER_FILE_NAMES as &$fileName)
            {
                $filePath = Packages::serverPath($package) . "/" . $fileName;
                if (file_exists($filePath))
                {
                    include($filePath);
                }
            }
        }
        //page head
        if (file_exists(Page::serverPath() . "/" . Page::PAGE_HEAD_FILE_NAME))
        {
            include(Page::serverPath() . "/" . Page::PAGE_HEAD_FILE_NAME);
        }

        //page style
        if (file_exists(Page::serverPath() . "/" . Page::PAGE_STYLE_FILE_NAME))
        {
            echo '<link rel="stylesheet" type="text/css" href="' . Page::httpPath() . '/' . Page::PAGE_STYLE_FILE_NAME . '">';
        }
?>
        </head>
        <body>
<?php
        //html before content
        foreach (Packages::names() as &$package)
        {
            foreach (Page::HTML_BEFORE_CONTENT_FILE_NAMES as &$fileName)
            {
                $filePath = Packages::serverPath($package) . "/" . $fileName;
                if (file_exists($filePath))
                {
                    include($filePath);
                }
            }
        }

        //page content
        foreach (Page::PAGE_CONTENT_FILE_NAMES as &$fileName)
        {
            $filePath = Page::serverPath() . "/" . $fileName;
            if (file_exists($filePath))
            {
                include($filePath);
            }
        }

        //html after content
        foreach (Packages::names() as &$package)
        {
            foreach (Page::HTML_AFTER_CONTENT_FILE_NAMES as &$fileName)
            {
                $filePath = Packages::serverPath($package) . "/" . $fileName;
                if (file_exists($filePath))
                {
                    include($filePath);
                }
            }
        }

        //html scripts
        foreach (Packages::names() as &$package)
        {
            foreach (Page::HTML_SCRIPTS_FILE_NAMES as &$fileName)
            {
                $filePath = Packages::serverPath($package) . "/" . $fileName;
                if (file_exists($filePath))
                {
                    include($filePath);
                }
            }
        }

        //page script
        if (file_exists(Page::serverPath() . "/" . Page::PAGE_SCRIPTS_FILE_NAME))
        {
            include(Page::serverPath() . "/" . Page::PAGE_SCRIPTS_FILE_NAME);
        }
        if (file_exists(Page::serverPath() . "/" . Page::PAGE_CODE_FILE_NAME))
        {
            echo '<script src="' . Page::httpPath() . '/' . Page::PAGE_CODE_FILE_NAME . '"></script>';
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