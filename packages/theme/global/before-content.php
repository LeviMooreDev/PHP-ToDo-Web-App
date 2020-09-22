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

if ($config["sidebar"] === true)
{
    ?>
    <aside id="nav-sidebar" class="<?= $config["database"] && setting("always-show-sidebar") ? "sidebar-always-show" : "" ?>">
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

$mainClass = $config["sidebar"] === false ? "sidebar-hide " : "";
$mainClass .= $config["database"] === true && setting("always-show-sidebar") ? "sidebar-always-show" : "";
?>
<div id="main" class="<?= $mainClass ?>">
    <div class="content">