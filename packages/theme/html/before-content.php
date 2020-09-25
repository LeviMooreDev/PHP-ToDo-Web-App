<?php
global $config;
global $pageName;

$menuItems = [
    [
        'name' => "Home",
        'icon' => "network-wired",
        'url' => "home"
    ],
    [
        'name' => "settings",
        'icon' => "cog",
        'url' => "settings"
    ],
    [
        'name' => "logout",
        'icon' => "door-open",
        'url' => "auth/logout"
    ]
];

$alwaysShowSidebar = UserSettings::get("theme", "always-show-sidebar", true);

if (Configuration::get("sidebar") === true)
{
    ?>
    <aside id="nav-sidebar" class="<?= $alwaysShowSidebar === true ? "sidebar-always-show" : "" ?>">
        <ul>
            <?php
            foreach ($menuItems as $item) : ?>
                <li>
                    <a href="/<?= $item["url"] ?>" class="nav-link <?php if ($pageName == $item["name"]) echo "active"; ?>">
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