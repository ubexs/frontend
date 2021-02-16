let _refInfo = $('#referral-data')
const referral = {
    userId: parseInt(_refInfo.attr('data-user-id'), 10) || undefined,
    referralId: parseInt(_refInfo.attr('data-id'), 10) || undefined,
}
if (referral.referralId) {
    $('#referral-information-box').append(`
<h2 style="font-size:1.5rem;">Invited By <span data-userid="${referral.userId}"></span></h2>
<p class="font-italic text-center" style="font-size:0.75rem;"><span data-userid="${referral.userId}"></span> invited you to ubexs! When you sign up, you'll both get an entry into our 100k Giveaway!</p>`);
    setUserNames([referral.userId]);
}

function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}
var year = new Date().getFullYear() - 13;
var i = year;
while (i > year - 100) {
    $('#birthYearFormSelect').append('<option value="'+i+'">'+i+'</option>');
    i -= 1;
}
$('#birthYearFormSelect').click(function() {
    $('#birthMonthFormSelect').removeAttr('disabled');
});
$('#birthYearFormSelect').change(function() {
    $('#birthMonthFormSelect').removeAttr('disabled');
    var year = parseInt($('#birthYearFormSelect').val());
    var months = 1;
    var monthIndex = months;
    while (monthIndex <= 12) { 
        monthIndex += 1;
    }
    $('#birthDayFormSelect').empty();
    var x = 1;
    while (x <= daysInMonth(parseInt($('#birthMonthFormSelect').val()), year)) {
        $('#birthDayFormSelect').append('<option value="'+x+'">'+x+'</option>');
        x += 1;
    }
});
$('#birthMonthFormSelect').click(function() {
    $('#birthDayFormSelect').removeAttr('disabled');
    var year = parseInt($('#birthYearFormSelect').val());
    var months = 1;
    var monthIndex = months;
    while (monthIndex <= 12) {
        monthIndex += 1;
    }
    $('#birthDayFormSelect').empty();
    console.log("empty");
    var x = 1;
    while (x <= daysInMonth(parseInt($('#birthMonthFormSelect').val()), year)) {
        console.log("ok");
        $('#birthDayFormSelect').append('<option value="'+x+'">'+x+'</option>');
        x += 1;
    }
});
$('#birthMonthFormSelect').change(function() {
    $('#birthDayFormSelect').removeAttr('disabled');
    var year = parseInt($('#birthYearFormSelect').val());
    var months = 1;
    var monthIndex = months;
    while (monthIndex <= 12) {
        monthIndex += 1;
    }
    $('#birthDayFormSelect').empty();
    console.log("empty");
    var x = 1;
    while (x <= daysInMonth(parseInt($('#birthMonthFormSelect').val()), year)) {
        console.log("ok");
        $('#birthDayFormSelect').append('<option value="'+x+'">'+x+'</option>');
        x += 1;
    }
});

function usernameOk(name) {
    console.log(name);
    return new Promise(function(resolve, reject) {
        request("/auth/username/available?username="+name, "GET")
            .then(function() {
                resolve();
            })
            .catch(function(e) {
                $('#signUpButton').removeAttr("disabled");
                warning(e.responseJSON.message);
            });
    });
}

$(document).on('click', '#signUpButton', function() {
    var year = parseInt($('#birthYearFormSelect').val());
    var month = parseInt($('#birthMonthFormSelect').val());
    var day = parseInt($('#birthDayFormSelect').val());
    if (moment(year+'-'+month+'-'+day, 'YYYY-M-D').isSameOrAfter(moment().subtract(13, 'years'))) {
        console.log(year+'-'+month+'-'+day);
        return warning('Sorry! You must be 13 years of age or older to join ubexs!');
    }
    var username = $('#username').val();
    var password = $('#password').val();
    var confirmPassword = $('#confirmPassword').val();
    var response = grecaptcha.getResponse();
    //if (response.length == 0) {
        //warning("Please fill out the captcha.");
        //return;
    //}
    if (username !== "" && password !== "" && username !== null && password !== null && password.length >= 6 && username.length >= 3 && confirmPassword === password && $('#birthDatePick').val() !== null) {
        $('#signUpButton').attr("disabled","disabled");
        const signupRequest = {
            username: username,
            password: password,
            birth: [
                day,
                month,
                year
            ],
            captcha: response,
        }
        if (referral.referralId) {
            signupRequest.referralId = referral.referralId;
        }
        usernameOk(username)
            .then(function() {
                request("/auth/signup", "POST",signupRequest)
                    .then(function() {
                        $('#signUpButton').removeAttr("disabled");
                        window.location.reload();
                    })
                    .catch(function(e) {
                        $('#signUpButton').removeAttr("disabled");
                        console.log(e);
                        warning(e.responseJSON.message);
                        grecaptcha.reset();
                    })
            })
    }else{
        if (password.length <= 5) {
            warning("Please enter a password longer than 5 Characters.");
        }else if (username.length <= 2) {
            warning("Please enter a username longer than 2 Characters.");
        }else if (confirmPassword !== password) {
            warning("Your password and confirmed password don't match.");
        }else{
            warning("Please confirm you have filled out all fields, then try again.");
        }
    }
});