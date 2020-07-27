$(document).on('click', '#submit', function() {
    var email = $('#email').val();
    var response = grecaptcha.getResponse();
    loading();
    request("/auth/request/password-reset", "PUT", JSON.stringify({'email': email, captcha: response}))
        .then(function(d) {
            success("If your email was valid and attached to an account, a password reset email has been sent to you.", function() {
                window.location.href = "/login";
            });
        })
        .catch(function(e) {
            console.error(e);
            warning(e.responseJSON.message);
        });
});