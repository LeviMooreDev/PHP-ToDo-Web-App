function submitForm() {
    if (validateForm($("#form"))) {
        callAPI("authentication","login", $("#form").serialize(), function (result) {
            if (result["success"] && result["success"] == true) {
                if (result["remember-key"]) {
                    document.cookie = "authentication-remember-key=" + result["remember-key"] + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
                }
                messageSuccess("Login success");
                setTimeout(function () { window.location = "/"; }, 500);
            }
            else if (result["success"] == false) {
                messageError("Wrong password");
            }
        });
    }
} 