<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<title>Simple Website</title>
<link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">
<link rel="stylesheet" href="<?= getPackageWebsiteBase("theme") ?>/css/fontawesome/css/all.min.css">
<?php if ($config["database"] === true && setting("dark-theme") == true) : ?>
    <link rel="stylesheet" href="<?= getPackageWebsiteBase("theme") ?>/css/dark-bootstrap.min.css">
<?php else : ?>
    <link rel="stylesheet" href="<?= getPackageWebsiteBase("theme") ?>/css/light-bootstrap.min.css">
<?php endif; ?>
<link rel="stylesheet" href="<?= getPackageWebsiteBase("theme") ?>/css/core.css">
