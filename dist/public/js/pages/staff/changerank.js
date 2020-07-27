$(document).on('click', '#changeUserStaffRankClick', e => {
    e.preventDefault();
    const newRank = parseInt($('#changeStaffRankOfUserSelect').val(), 10);
    console.log(newRank);
    const userId = parseInt($('#userId').val(), 10);
    request('/staff/user/'+userId+'/rank', 'PATCH', JSON.stringify({'rank': newRank})).then(_ => {
        success('This users rank has been updated.');
    }).catch(e => {
        warning(e.responseJSON.message);
    });
})