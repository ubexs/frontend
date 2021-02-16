let currentCountry = 'UNKNOWN';

/**
 * Update session cookie status
 * @param {boolean} ga Google Analytics enabled? true/false
 */
const updateCookieStatus = (ga) => {
    request('/auth/cookie-consent', 'PATCH', {
        googleAnalytics: ga,
    }).then(d => {
        // OK
        try {
            localStorage.setItem('cookie_prompt_success_v3', currentCountry)
        } catch (e) {

        }
    }).catch(err => {
        warning('Cookie consent information could not be updated. Please try again.');
    })
}

const openCookieConsent = () => {
    // prompt
    $('body').append(`
        
        <div class="fixed-bottom" style="z-index:99999;display:none;" id="gdpr-cookie-notice">
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body" style="padding-bottom:1rem;padding-top:1rem;">
                            <div class="row">
                                <div class="col-12 col-lg-8">
                                    <h3 style="font-size:1.15rem;margin-bottom:0;">GDPR Cookie Notice</h3>
                                    <p>ubexs uses Google Analytics, which stores cookies on your computer. ubexs also uses technical cookies that cannot be declined. Are you OK with third party analytical cookies? <span style="cursor:pointer;font-size:0.75rem;" data-toggle="modal" data-target="#cookieConsentInfoModal">[info]</span><br><br> You can always change your prefereces by scrolling down to the bottom of any page, and clicking "Manage Cookie Consent".</p>
                                </div>
                                <div class="col-12 col-lg-4">
                                    <button type="button" class="btn btn-small btn-dark cookie-button" id="confirmOkWithCookies" style="width:100%;margin:1rem auto 0 auto;display: block;">Yes</button>
                                    <button type="button" class="btn btn-small btn-outline-dark cookie-button" id="confirmNotOkWithCookies" style="width:100%;margin:1rem auto 0 auto;display: block;">No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        `);
    $('body').append(`
        <div class="modal fade" id="cookieConsentInfoModal" tabindex="-1" role="dialog" aria-labelledby="cookieConsentInfoModalTitle" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="cookieConsentInfoModalTitle">Cookie Consent Information</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <h5>Google Analytics</h5>
                <p>In order to learn about our userbase for marketing and feature research purposes, we use Google Analytics. Google Analytics stores Cookies on your device in order to track you across our website. You can decline Google Analytics cookies by pressing the "No" button inside the cookie disclaimer.
                <br>
                <br>
                You can learn more info about Google's terms of service <a href="https://marketingplatform.google.com/about/analytics/terms/us/" rel="nofollow noopener">here</a>.
                </p>
                <br>
                <h5>Cloudflare Cookies</h5>
                <p>A third party service used by Blockshub, Cloudflare, uses a mandatory "__cfduid" cookie that cannot be declined. You can learn more about the cookie <a href="https://support.cloudflare.com/hc/en-us/articles/200170156-Understanding-the-Cloudflare-Cookies" rel="nofollow noopener">here</a>, and view Cloudflare's privacy policy <a href="https://www.cloudflare.com/privacypolicy/">here</a>.</p>
                <br>
                <h5>Session Cookies</h5>
                <p>BlocksHub uses cookies for managing users who logged in, managing cookie consent, for and other non-tracking purposes. Due to the necessity of these cookies, they cannot be declined.</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>`);
    $('div#gdpr-cookie-notice').fadeIn(550);

}

$(document).on('click', '.cookie-button', function (e) {
    $('div#gdpr-cookie-notice').fadeOut(550);
    setTimeout(() => {
        $('div#gdpr-cookie-notice').remove();
    }, 551);
});
$(document).on('click', '#confirmOkWithCookies', function (e) {
    e.preventDefault();
    updateCookieStatus(true);
});
$(document).on('click', '#confirmNotOkWithCookies', function (e) {
    e.preventDefault();
    updateCookieStatus(false);
});
$(document).on('click', '#openCookieInfo', function (e) {
    e.preventDefault();
})


const cookieConsent = () => {
    // default to false (for example, if user has cookies/localstorage disabled)
    let userPromptedWithCookieNotice = 'false';
    // try to remove the old (unused) cookie consent
    try {
        localStorage.removeItem('cookie_prompt_success');
        localStorage.removeItem('cookie_prompt_success_v2');
    } catch (e) {
        // ignore for now
    }
    try {
        userPromptedWithCookieNotice = localStorage.getItem('cookie_prompt_success_v3');
    } catch (e) {
        console.error('[warning] error getting cookie prompt status', e);
    }
    // Open the consent if it is not false
    if (userPromptedWithCookieNotice !== currentCountry) {
        openCookieConsent();
    }
}

request('/auth/current-country', 'GET').then(data => {
    currentCountry = data.country;
    if (data.cookiePromptRequired) {
        cookieConsent();
    } else {
        updateCookieStatus(true);
    }
})
$(document).on('click', '#open-cookie-consent', function (e) {
    e.preventDefault();
    openCookieConsent();
});
// <a href="#" id="open-cookie-consent">Manage Cookie Consent</a>