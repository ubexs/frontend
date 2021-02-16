$(document).on('click', '#changePassword', function() {
    var userid = $('#userId').val();
    request("/staff/user/"+userid+"/resetpassword", "POST",)
        .then(function(d) {
            success("Link: "+"https://www.ubexs.com/reset/password?userId="+userid+"&code="+d.code, function() {
            });
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
        });
});