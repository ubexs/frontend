$(document).on('click', '#createUrl', function (e) {
    e.preventDefault();
    request('/staff/ip/whitelist', 'POST', {}).then(d => {
        let code = d.code;
        let url = 'https://www.ubexs.com/ip/whitelist?code=' + code;
        success('Url: ' + url);
    })
});