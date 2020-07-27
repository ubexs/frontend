$(document).on('click', '#banUser', function() {
    var userid = $('#userId').val();
    var reason = $('#reason').val();
    var len = parseInt($('#length').val());
    if (typeof len === "undefined" || len === null || isNaN(len)) {
        len = 0;
    }
    var lenType = $('#lengthType').val();
    var term = parseInt($('#isTerminated').val());
    var del = parseInt($('#isDeleted').val());
    var privateReason = $('#privateNotes').val();
    request("/staff/user/"+userid+"/ban", "POST", JSON.stringify({"reason":reason,"privateReason": privateReason,"length":len,"lengthType":lenType,"terminated":term,"deleted":del}))
        .then(function() {
            success("This user has been banned.", function() {
            })
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
        });
});

$(document).on('click', '.autofill-reason', function(e) {
    console.log('Click')
    e.preventDefault();
    switch (parseInt($(this).attr('data-id'), 10)) {
        case 0: {
            return $('#reason').val('Swearing is not allowed on our platform.');
        };
        case 1: {
            return $('#reason').val('Harassment towards other users is expressly forbidden on our platform.');
        };
        case 2: {
            return $('#reason').val('Dating on our Platform is against our terms of service.');
        };
        case 3: {
            return $('#reason').val('Offsite links are not allowed on our platform');
        };
        case 4: {
            return $('#reason').val('The image you uploaded is not appropiate for our platform. Please review our Terms of Service before uploading content');
        };
        case 5: {
            return $('#reason').val('Scamming is a violation of our Terms of Service');
        };
        case 6: {
            return $('#reason').val('Account Theft is a violation of our Terms of Service. Items and/or currency may have been removed from your account');
        };
    }
});