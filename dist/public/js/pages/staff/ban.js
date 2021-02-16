$(document).on('change', '#ban-type', function (e) {
    e.preventDefault();
    let v = $(this).val();
    console.log('v', v);
    if (v === '2') {
        $('#ban-len').show();
    } else {
        $('#ban-len').hide();
    }
});

$(document).on('click', '#banUser', function () {
    var userid = $('#userId').val();
    var reason = $('#reason').val();
    var len = parseInt($('#length').val());
    if (typeof len === "undefined" || len === null || isNaN(len)) {
        len = 0;
    }
    var lenType = $('#lengthType').val();
    var term = 0;
    var del = 0;
    var privateReason = $('#privateNotes').val();

    var type = $('#ban-type').val();
    if (type !== '2') {
        lenType = 'hours';
        len = 0;
    }
    if (type === '4') {
        del = 1;
        term = 1;
    }
    if (type === '3') {
        del = 0;
        term = 1;
    }
    request("/staff/user/" + userid + "/ban", "POST", JSON.stringify({ "reason": reason, "privateReason": privateReason, "length": len, "lengthType": lenType, "terminated": term, "deleted": del }))
        .then(function () {
            success("This user has been banned.", function () {
            })
        })
        .catch(function (e) {
            warning(e.responseJSON.message);
        });
});

$(document).on('click', '.autofill-reason', function (e) {
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