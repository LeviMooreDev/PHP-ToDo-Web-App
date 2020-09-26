<?php
$sidebarItems = [];
foreach (Packages::names() as $package)
{
    $file = Packages::serverPath($package) . "/theme/sidebar.php";
    if (file_exists($file))
    {
        $items = include($file);
        foreach ($items as $item)
        {
            array_push($sidebarItems, $item);
        }
    }
}
usort($sidebarItems, function($a, $b) {
    return $a['order'] <=> $b['order'];
});

$alwaysShowSidebar = UserSettings::get("theme", "always-show-sidebar", true);

if (Configuration::get("sidebar") === true)
{
    ?>
    <aside id="nav-sidebar" class="<?= $alwaysShowSidebar === true ? "sidebar-always-show" : "" ?>">
        <ul>
            <?php
            foreach ($sidebarItems as $item) : ?>
                <li>
                    <a href="/<?= $item["url"] ?>" class="nav-link">
                        <i class="nav-icon fas fa-<?= $item["icon"] ?>"></i>
                        <p class="nav-name"><?= ucfirst($item["name"]); ?></p>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </aside>
<?php
}

$mainClass = Configuration::get("sidebar") === false ? "sidebar-hide " : "";
$mainClass .= $alwaysShowSidebar === true ? "sidebar-always-show" : "";
?>
<div id="main" class="<?= $mainClass ?>">
    <div class="content">