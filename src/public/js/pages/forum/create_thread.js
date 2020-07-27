$(document).on('click', '#createThread', function () {
    var title = $('#threadTitle').val();
    if (title.length > 64 || title.length < 3) {
        warning("Your title must be at least 3 characters, and at most 64 characters.");
        return;
    }
    var body = $('#threadBody').val();
    var sub = parseInt($('#threadSubCategory').val());
    var locked = parseInt($('#threadLocked').val());
    var pinned = parseInt($('#threadPinned').val());
    if (isNaN(locked) || isNaN(pinned)) {
        locked = 0;
        pinned = 0;
    }
    request("/forum/thread/create", "PUT", JSON.stringify({
        "title": title,
        "body": body,
        "subCategoryId": sub,
        "locked": locked,
        "pinned": pinned,
    }))
        .then(function (d) {
            console.log(d);
            window.location.href = "/forum/thread/"+d.threadId+"?page=1";
        })
        .catch(function (e) {
            console.log(e);
            warning(e.responseJSON.message);
        });
});