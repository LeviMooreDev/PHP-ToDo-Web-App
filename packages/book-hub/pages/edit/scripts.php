<?php Awesomplete::AddScript(); ?>
<script>
    var maxUploadSize = <?=preg_replace("/[^0-9]/", "", ini_get('post_max_size'))?>;
</script>