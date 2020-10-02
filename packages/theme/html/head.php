<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<title><?=Info::Name?></title>
<link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">
<?php if (UserSettings::get("theme", "dark-theme", false) == true) : ?>
    <link rel="stylesheet" href="<?= Packages::httpPath("theme") ?>/css/dark-bootstrap.min.css">
<?php else : ?>
    <link rel="stylesheet" href="<?= Packages::httpPath("theme") ?>/css/light-bootstrap.min.css">
<?php endif; ?>
<link rel="stylesheet" href="<?= Packages::httpPath("theme") ?>/css/core.css">
