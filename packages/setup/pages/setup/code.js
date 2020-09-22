function submitForm() {
    if (validateForm($("#form"))) {
        messageWorking(() => {
            callAPI("setup", "setup", $("#form").serialize(), function(result) {
                if (result["success"]) {
                    messageSuccess("Setup complete");
                    setTimeout(function() {
                        window.location = "/";
                    }, 500);
                } else {
                    var error = result["error"];
                    console.log(error);
                    messageError(error);
                    
                    if (error.toLowerCase().includes("file") && $("#host").val().toLowerCase() == "localhost") {
                        $("#host").addClass("is-invalid");
                    }
                    if (error.toLowerCase().includes("name or service not known")) {
                        $("#host").addClass("is-invalid");
                    }
                    if (error.toLowerCase().includes("access denied")) {
                        if (error.toLowerCase().includes("password")) {
                            $("#username").addClass("is-invalid");
                            $("#password").addClass("is-invalid");
                        }
                        if (error.toLowerCase().includes("database")) {
                            $("#database").addClass("is-invalid");
                        }
                    }
                }
            });
        });
    }
}