function submitForm() {
    if (validateForm($("#form"))) {
        callAPI("authentication", "set-password", $("#form").serialize(), function (result) {
            if (result["success"]) {
                messageSuccess("Success");
                setTimeout(function () { window.location = "/auth/login"; }, 500);
            }
            else {
                messageError(result["error"]);
            }
        });
    }
} 