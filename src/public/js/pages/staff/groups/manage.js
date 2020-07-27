var groupdata = $('#metadata-for-group');
var groupId = groupdata.attr('data-groupid');
$(document).on('click', '#update-group-status', function(e) {
    e.preventDefault();
    loading();
    let val = parseInt($('#group-status').val(), 10);
    request('/staff/groups/'+groupId+'/status', 'PATCH', {
        status: val,
    }).then(d => {
        success('This group\'s status has been updated.')
    }).catch(e => {
        warning(e.responseJSON.message);
    })
});