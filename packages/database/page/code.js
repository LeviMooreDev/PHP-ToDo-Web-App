function submitForm()
{
    if (!API.validateForm(document.getElementById("form")))
    {
        Alert.error("Form validation failed.")
        return;
    }

    Alert.working(() =>
    {
        API.call("database", "setup", API.serializeForm(document.getElementById("form")),
            function(result) //success
            {
                if (result["success"])
                {
                    Alert.success("Setup complete");
                    setTimeout(function()
                    {
                        window.location = "/";
                    }, 750);
                }
                else
                {
                    var error = result["error"];
                    Alert.error(error);

                    if (error.toLowerCase().includes("file") && $("#host").val().toLowerCase() == "localhost")
                    {
                        $("#host").addClass("is-invalid");
                    }
                    if (error.toLowerCase().includes("name or service not known"))
                    {
                        $("#host").addClass("is-invalid");
                    }
                    if (error.toLowerCase().includes("access denied"))
                    {
                        if (error.toLowerCase().includes("password"))
                        {
                            $("#username").addClass("is-invalid");
                            $("#password").addClass("is-invalid");
                        }
                        if (error.toLowerCase().includes("database"))
                        {
                            $("#database").addClass("is-invalid");
                        }
                    }
                }
            },
            function(result) //failed
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
            }
        );
    });
}