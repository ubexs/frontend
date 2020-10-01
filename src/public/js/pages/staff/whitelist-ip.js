$(document).on('click', '#createUrl', function (e) {
    e.preventDefault();
    request('/staff/ip/whitelist', 'POST', {}).then(d => {
        let code = d.code;
        let url = 'https://www.blockshub.net/ip/whitelist?code=' + code;
        success('Url: ' + url);
    })
});