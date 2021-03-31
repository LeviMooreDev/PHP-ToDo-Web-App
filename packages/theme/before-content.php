<?php
$menuItems = [];
foreach (Packages::names() as $package)
{
    $file = Packages::serverPath($package) . "/theme/menu.php";
    if (file_exists($file))
    {
        $items = include($file);
        foreach ($items as $item)
        {
            array_push($menuItems, $item);
        }
    }
}
usort($menuItems, function($a, $b) {
    return $a['order'] <=> $b['order'];
});
?>

<div id="main">
<?php if(Configuration::get("menu") === true) : ?>
<nav id="top-menu" class="navbar navbar-expand-lg navbar-dark bg-dark">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <a class="navbar-brand" href="/"><?=Info::Name?></a>

    <div class="collapse navbar-collapse" id="navbarToggler">
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
        <?php foreach ($menuItems as $item) : ?>
            <li class="nav-item">
                <?php if(isset($item["separator"])) : ?>
                <span class="nav-link menu-separator"> | </span>
                <?php elseif(isset($item["url"])) : ?>
                    <?php if(strpos($item["url"], 'javascript:') !== false) : ?>
                        <a class="nav-link" href="<?= $item["url"] ?>"><?= ucfirst($item["name"]); ?></a>
                    <?php else : ?>
                        <a class="nav-link" href="/<?= $item["url"] ?>"><?= ucfirst($item["name"]); ?></a>
                    <?php endif; ?>
                <?php else : ?>
                <span class="nav-link"><?= ucfirst($item["name"]); ?></span>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
        </ul>
        <!-- <form class="form-inline my-2 my-lg-0">
            <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
            <button class="btn btn-outline-primary" type="submit">Search</button>
        </form> -->
    </div>
</nav>
<?php endif; ?>
    <div class="content">