<?php BootstrapSelect::AddScript(); ?>
<?php Asuggest::AddScript(); ?>
<script>
var coverQuality = "<?=str_replace("%","",UserSettings::get("book-hub", "cover-quality", "20%"));?>"; 
</script>