function submitForm()
{
    if (!API.validateForm(document.getElementById("form")))
    {
        Alert.error("Form validation failed.")
        return;
    }

    API.call("authentication", "login", API.serializeForm(document.getElementById("form")),
        function(result)
        {
            if (result["success"] && result["success"] == true)
            {
                if (result["remember-key"])
                {
                    document.cookie = "authentication-remember-key=" + result["remember-key"] + "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
                }
                Alert.success("Login success");
                setTimeout(function()
                {
                    window.location = "/";
                }, 750);
            }
            else if (result["success"] == false)
            {
                Alert.error("Wrong password");
            }
        },
        function(result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
        }
    );
}