function submitForm()
{
    if(!API.validateForm(document.getElementById("form"))) {
        Alert.error("Form validation failed.")
        return;
    }

    API.call("user-settings", "update", API.serializeForm(document.getElementById("form")),
        function (result) //success
        {
            Alert.success("Your settings has been saved");
            setTimeout(function ()
            {
                window.location = window.location.href;
            }, 1000);
        },
        function(result) //failed
        {
            Alert.error("Something went wrong. See console (F12) for more info.");
        }
    );
}

function resetSettings()
{
    Alert.yesNo("Are you sure you want to reset all settings?", () =>
    {
        API.call("user-settings", "reset", "",
            function (result) //success
            {
                Alert.success("Your settings has been reset");
                setTimeout(function ()
                {
                    window.location = window.location.href;
                }, 1000);
            },
            function(result) //failed
            {
                Alert.error("Something went wrong. See console (F12) for more info.");
            }
        );
    });
}