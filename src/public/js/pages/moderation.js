request('/auth/moderation/history', 'GET')
.then(d => {
    let div = $('#moderation-history').empty();
    if (d.length === 0) {
        div.append(`<p>Your account has no moderation history. Good job :)</p>`);
        return;
    }
    div.append(`
        
        <div class="row">
            <div class="col-12">
                <table class="table">
                    <thead>
                    <tr>
                        <th scope="col" style="border-top: none;">#</th>
                        <th scope="col" style="border-top: none;">Reason</th>
                        <th scope="col" style="border-top: none;">Date</th>
                        <th scope="col" style="border-top: none;">Expired</th>
                        <th scope="col" style="border-top: none;">Terminated?</th>
                    </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
        
        `);
    let table = div.find('tbody');
    for (const item of d) {
        let termed = 'No';
        if (item.terminated === 1) {
            termed = 'Yes';
        }
        table.append(`
        <tr>
            <th scope="row">${item.moderationActionId}</th>
            <td>${xss(item.reason)}</td>
            <td>${moment(item.createdAt).fromNow()}</td>
            <td>${moment(item.until).fromNow()}</td>
            <td>${termed}</td>
        </tr>
        `);
    }
})
.catch(e => {
    console.log(e);
    warning(e.responseJSON.message);
})