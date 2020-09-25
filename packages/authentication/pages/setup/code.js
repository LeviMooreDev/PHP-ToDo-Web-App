function submitForm()
{
    if (!API.validateForm(document.getElementById("form")))
    {
        Alert.error("Form validation failed.")
        return;
    }

    API.call("authentication", "set-password", API.serializeForm(document.getElementById("form")),
        function(result)
        {
            if (result["success"])
            {
                Alert.success("Success");
                setTimeout(function()
                {
                    window.location = "/auth/login";
                }, 750);
            }
            else
            {
                Alert.error(result["error"]);
            }
        },
        function(result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
        }
    );
}