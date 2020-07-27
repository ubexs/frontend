let twoFactorJwt = '';
$(document).on('click', '#signInButton', function() {
    console.log("Sign In");
    var username = $('#username').val();
    var password = $('#password').val();
    // var response = grecaptcha.getResponse();
    //if (response.length == 0) {
        //warning("Please fill out the captcha.");
        //return;
    //}
    if (username !== "" && password !== "" && username !== null && password !== null) {
        $('#signInButton').attr("disabled","disabled");
        request("/auth/login", "POST", JSON.stringify({username:username,password:password}))
            .then(function(d) {
                if (d.isTwoFactorRequired) {
                    twoFactorJwt = d.twoFactor;
                    $('#login-row').empty().append(`
                    <div class="col-12">
                        <p>Please enter your two-factor authentication token to login.</p>
                    </div>
                    <div class="col-12">
                        <input type="text" class="form-control" id="two-factor-token" value="" maxlength="7" placeholder="Two-Factor Token">
                    </div>
                    <div class="col-12">
                        <button type="button" class="btn btn-small btn-success" id="twoFactorLogin" style="margin:0 auto;display: block;">Continue</button>
                    </div>
                `);
                }else{
                    $('#signInButton').removeAttr("disabled");
                    window.location.reload();
                }
            })
            .catch(function(e) {
                // grecaptcha.reset();
                $('#signInButton').removeAttr("disabled");
                console.log(e);
                warning(e.responseJSON.message);
            })
    }else{
        warning("Please enter a valid username and password.");
    }
    // Get Friends
    // request("/user/"+userId+"/friends", "POST", )
});

$(document).on('click', '#twoFactorLogin', function(e) {
    let token = $('#two-factor-token').val().replace(/\s/g,'').replace(/,/g, '').replace(/\./g, '');
    request("/auth/login/two-factor", "POST", JSON.stringify({code: twoFactorJwt, token: token}))
    .then(function(d) {
        window.location.reload();
    }).catch(e => {
        if (e.responseJSON && e.responseJSON.error && e.responseJSON.error.code === 'InvalidTwoFactorCode') {
            warning("It seems your 2FA code is invalid. Please try again");
        }else{
            warning(e.responseJSON.message);
        }
        console.log(e);
    });
});