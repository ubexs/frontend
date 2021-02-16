$(document).on('click', '#unlockAccount', function() {
    request("/auth/unlock", "POST", "{}")    
        .then(function(d) {
            window.location.reload();
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
        })
})