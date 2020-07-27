$(document).on('click', '#updatePassword', function() {
    var userid = $('#passworddata').attr("data-userId");
    var code = $('#passworddata').attr("data-code");
    var pass = $('#newPassword').val();
    request("/auth/reset/password", "PATCH", JSON.stringify({'userId': userid, 'code': code, 'newPassword': pass}))
        .then(function(d) {
            success("Your password has been reset. Please login.", function() {
                window.location.href = "/login";
            });
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
        });
});