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

<?php if(Configuration::get("menu") === true) : ?>
<nav id="search-navbar" class="navbar navbar-expand-lg navbar-dark bg-dark">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <a class="navbar-brand" href="#"><?=Info::Name?></a>

    <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
        <?php foreach ($menuItems as $item) : ?>
            <li class="nav-item">
                <?php if(isset($item["url"])) : ?>
                <a class="nav-link" href="/<?= $item["url"] ?>"><?= ucfirst($item["name"]); ?></a>
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

<div id="main">
    <div class="content">