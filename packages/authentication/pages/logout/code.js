API.call("authentication", "logout", "",
    function(result)
    {
        window.location = "/";
    },
    function(result)
    {
        window.location = "/";
    }
);