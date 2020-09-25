<div class="row">
    <div class="col-2"></div>
    <div class="col-lg-8">
        <form id="form" action="javascript:submitForm()">
            <div class="card">
                <h3 class="card-header">Settings</h3>
                <div class="card-body">
                    <?php
                    Database::connect();
                    $result = Database::query("SELECT * FROM `user-settings` ORDER BY `package`, `name`");
                    Database::disconnect();
                    if ($result->num_rows > 0)
                    {
                        $package = "";
                        while ($row = $result->fetch_assoc())
                        {
                            if ($row["package"] !== $package)
                            {
                                if ($package != "")
                                {
                                    echo "<br>";
                                }

                                $package = $row["package"];
                                echo "<h4>" . ucwords($package) . "</h4>";
                            }

                            $id = $row["id"];
                            $name = $row["name"];
                            $nameLabel = ucwords(str_replace("-", " ", $name));
                            $description = $row["description"];
                            $value = $row["value"];
                            $dataType = $row["data_type"];
                            ?>

                    <div class='form-group'>
                        <label for='<?= $id ?>'><?= $nameLabel ?></label>
                        <?php if ($dataType === "text") : ?>
                        <input name='<?= $id ?>' class='form-control' type='text' value='<?= $value ?>' required>
                        <?php elseif ($dataType === "number") : ?>
                        <input name='<?= $id ?>' class='form-control' type='number' value='<?= $value ?>' required>
                        <?php elseif ($dataType === "boolean") : ?>
                        <input type='hidden' name="<?= $id ?>" value="false" />
                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="<?= $id ?>" name="<?= $id ?>"
                                value="true" <?= ($value === "true" ? "checked" : "") ?>>
                            <label class="custom-control-label" for="<?= $id ?>"></label>
                        </div>
                        <?php endif; ?>
                        <p class='small-print'><i><?= $description ?></i></p>
                    </div>
                    <?php }
                    } ?>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary" type="submit">Save</button>
                    <button class="btn btn-warning float-right" onclick="resetSettings()" type="button">Reset</button>
                </div>
            </div>
        </form>
    </div>
</div>