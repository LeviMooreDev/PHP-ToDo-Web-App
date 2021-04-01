<?php
class Material
{
    static function AddCSS()
    {
		?>
		<link href="https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i|Roboto+Mono:300,400,700|Roboto+Slab:300,400,700" rel="stylesheet">
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
		<link href="<?= Packages::selfHttpPath() ?>/static/material.css" rel="stylesheet">
		<?php
    }
    static function AddScripts()
    {
		?>
        <script src="<?= Packages::selfHttpPath() ?>/static/popper.min.js"></script>
		<script src="<?= Packages::selfHttpPath() ?>/static/bootstrap.min.js"></script>
		<script src="<?= Packages::selfHttpPath() ?>/static/material.min.js"></script>
		<?php
	}
}