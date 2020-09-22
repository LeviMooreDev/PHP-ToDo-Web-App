function submitForm() {
    if (validateForm($("#form"))) {
        callAPI("settings", "set-settings", $("#form").serialize(), function (result) {
            messageSuccess("Your settings has been saved");
            setTimeout(function () { window.location = "/settings"; }, 1000);
        });
    }
}

function resetSettings() {
    messageYesNo("Are you sure you want to reset all settings?", () => {
        callAPI("set-settings", "reset=all", function (result) {
            messageSuccess("Your settings has been reset");
            setTimeout(function () { window.location = "/settings"; }, 1000);
        });
    });
}