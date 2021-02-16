$(document).on('click', '#updateSite', function() {
    var siteDisabled = parseInt($('#siteEnabled').val());
    request("/staff/site", "PATCH", JSON.stringify({"siteDisabled":siteDisabled}))
        .then(function(d) { 
            if (siteDisabled === 1) {
                success("The site has been disabled. All pages, with the exception of this one, will be inaccessible until the site is enabled again.");
            }else{
                success("The site has been enabled.");
            }
        })
        .catch(function(e) {
            console.log(e);
            warning(e.responseJSON.message);
        });
});