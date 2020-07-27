$('.leaderboard-ad').remove();
let codeToIncludeInRedirect = undefined;
let serviceMetaInfo = $('.meta-info-for-service').first();
let returnUrl = serviceMetaInfo.attr('data-returnurl');
let serviceName = serviceMetaInfo.attr('data-service-name');
console.log(returnUrl);

request('/auth/authenticate-to-service', 'POST', {
    returnUrl: returnUrl,
})
.then(d => {
    
    $('h1#service-name-header').show();
    console.log('Ok');
    codeToIncludeInRedirect = d.code;
    $('#auth-service-pending').empty();
    $('#auth-service-pending').append(`
    <p style="margin-top:0;font-size:0.85rem;">Are you sure you'd like to sign into <span class="font-weight-bold">${xss(serviceName)}</span>?</p>
    <p style="margin-top:1rem;">This will grant the operators of ${xss(serviceName)} access to:</p>
    <ul>
        <li>Your IP Address <span style="font-size: 0.75rem;">(This tells them where you live!)</span></li>
        <li>Your Username</li>
        <li>Your UserId</li>
    </ul>
    <p style="opacity:0.85;margin-top:1rem;font-size:0.75rem;">They will not have access to your password, or any other sensitive info that isn't listed above. Once granted, you cannot revoke these permissions. Only continue if you trust ${xss(serviceName)}.</p>
    
    <form method="POST" action="${xss(returnUrl)}" style="margin-top:1rem;">
        <input type="hidden" name="code" value="${xss(codeToIncludeInRedirect)}">
        <input class="form-control btn btn-success" type="submit" disabled="disabled" id="proceed-to-service">
    </form>
    `);
    setTimeout(() => {
        $('#proceed-to-service').removeAttr('disabled');
    }, 2500);
    setTimeout(() => {
        $('h1#service-name-header').remove();
        $('#auth-service-pending').empty().append(`<p>This form has timed-out. Please reload the page to continue.</p>`);
    },60 * 4 * 1000);
    
})
.catch(e => {
    console.error(e);
    $('title').html('Error - BlocksHub');
    $('h1#service-name-header').remove();
    $('#auth-service-pending').empty();
    $('#auth-service-pending').append(`<p>Oops, it looks like there was an error loading this page. Please go back, and try again.</p>`);
    let data = e.responseJSON;
    if (!data) {
        return;
    }
    data = data.error;
    let code = data.code;
    if (code === 'AuthenticationServiceBlacklisted') {
        $('#auth-service-pending').append(`<p style="margin-top:2rem;opacity:0.75;font-size:0.85rem;text-align:center;">Error Code: ${code}</p>`);
        return;
    }else if (code === 'AuthenticationServiceConstraintHTTPSRequired') {
        $('#auth-service-pending').append(`<p style="margin-top:2rem;opacity:0.75;font-size:0.85rem;text-align:center;">Error Code: ${code}</p>`);
        return;
    }else if (code === 'InvalidReturnUrl') {
        $('#auth-service-pending').append(`<p style="margin-top:2rem;opacity:0.75;font-size:0.85rem;text-align:center;">Error Code: ${code}</p>`);
        return;
    }else{
        $('#auth-service-pending').append(`<p style="margin-top:2rem;opacity:0.75;font-size:0.85rem;text-align:center;">Error Code: InternalServerError</p>`);
        return;
    }
});