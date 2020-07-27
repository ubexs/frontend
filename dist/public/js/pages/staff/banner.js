$(document).on('click', '#banUser', function() {
    var enabled = parseInt($('#isEnabled').val());
    var text = $('#bannerText').val();
    request("/staff/banner", "PATCH", JSON.stringify({"text":text,"enabled": enabled}))
        .then(function() {
            if (enabled === 0) {
                success("The banner has been disabled. Please wait about 10 seconds for this to take effect.");
            }else{
                success("The banner text has been updated. Please wait about 10 seconds for this to take effect.");
            }
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
        });
});