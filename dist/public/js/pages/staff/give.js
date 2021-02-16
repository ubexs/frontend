$(document).on('click', '#giveItem', function() {
    var userid = $('#userId').val();
    var catalogItemId = parseInt($('#catalogId').val());
    request("/staff/user/"+userid+"/give/"+catalogItemId, "POST")
        .then(function() {
            success("The Item Specified has been given to the Specified user.", function() {
            })
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
        });
});