$(document).on('click', '#createReply', function () {
    var body = $('#replyBody').val();
    var replyId = $('#forumdata').attr("data-threadid");
    request("/forum/thread/"+replyId+"/reply", "PUT", JSON.stringify({
        "body": body,
    }))
        .then(function (d) {
            window.location.href = "/forum/thread/"+replyId+"?page=1";
        })
        .catch(function (e) {
            console.log(e);
            warning(e.responseJSON.message);
        });
});