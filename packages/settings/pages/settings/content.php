  <div class="row">
    <div class="col-2"></div>
    <div class="col-lg-8">
      <form id="form" action="javascript:submitForm()">
        <div class="card">
          <h3 class="card-header">Settings</h3>
          <div class="card-body">
            <?php
            $result = query("SELECT * FROM `settings` ORDER BY `group_`, `name`");
            if ($result->num_rows > 0) {
              $group = "";
              while ($row = $result->fetch_assoc()) {
                if ($row["group_"] !== $group) {
                  if ($group != "") {
                    echo "<br>";
                  }

                  $group = $row["group_"];
                  echo "<h4>" . ucwords($group) . "</h4>";
                }

                $name = $row["name"];
                $nameLabel = ucwords(str_replace("-", " ", $name));
                $description = $row["description"];
                $value = setting($name, true);
                $dataType = $row["data_type"]; ?>

                <div class='form-group'>
                  <label for='<?= $name ?>'><?= $nameLabel ?></label>
                  <?php if ($dataType === "text") : ?>
                    <input name='<?= $name ?>' class='form-control' type='text' value='<?= $value ?>' required>
                  <?php elseif ($dataType === "number") : ?>
                    <input name='<?= $name ?>' class='form-control' type='number' value='<?= $value ?>' required>
                  <?php elseif ($dataType === "boolean") : ?>
                    <input type='hidden' name="<?= $name ?>" value="false" />
                    <div class="custom-control custom-switch">
                      <input type="checkbox" class="custom-control-input" id="<?= $name ?>" name="<?= $name ?>" value="true" <?= ($value === true ? "checked" : "") ?>>
                      <label class="custom-control-label" for="<?= $name ?>"></label>
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