let code = $('#ip-whitelist').attr('data-code')
request('/staff/ip/whitelist/' + code, 'POST').then(d => {
    success('Your device has been whitelisted. Please continue.', () => {
        window.location.href = '/';
    })
}).catch(err => {
    warning('It looks like this URL is expired or invalid.', () => {
        window.location.href = '/';
    })
})