$('#containingItemsDiv').empty();
window.offset = 0;
loadMessages();
$('#openMessages').click(function() {
    $('#containingItemsDiv').empty();
    window.offset = 0;
    loadMessages();
});
$('#openFriends').click(function() {
    $('#containingItemsDiv').empty();
    window.offset = 0;
    loadFriends();
});
$(document).on('click', '.loadMoreItems', function() {
    loadMessages();
});
$(document).on('click', '.loadMoreFriends', function() {
    loadFriends();
});
$(document).on('click', '.acceptFriendRequest', function() {
    var userid = $(this).attr("data-userid");
    var del = $(this).parent().parent().parent().parent();
    request('/user/'+userid+'/friend/', "PUT")
        .then(function(d) {
            toast(true, "The friend request has been accepted!")
            del.remove();
        })
        .catch(function(e) {
            del.remove();
            console.log(e);
            toast(false, "The request couldn't be accepted. Please try again later.");
        });
});
$(document).on('click', '.declineFriendRequest', function() {
    var userid = $(this).attr("data-userid");
    var del = $(this).parent().parent().parent().parent();
    request('/user/'+userid+'/friend/', "DELETE")
        .then(function(d) {
            toast(true, "The friend request has been declined.")
            del.remove();
        })
        .catch(function(e) {
            del.remove();
            console.log(e);
            toast(false, "The request couldn't be declined. Please try again later.");
        });
});
function loadFriends() {
    $('.loadMoreItems').hide();
    request("/notifications/requests", "GET")
        .then(function(d) {
            if (d.length <= 0) {
                if (window.offset === 0) {
                    $('#containingItemsDiv').append('<div class="col-sm-12"><h5 class="text-center" style="margin-top:1rem;">You do not have any friend requests.</h5></div>');
                }
            }
            var userIds =[];
            if (d.length >= 25) {
                $('.loadMoreItems').show();
                window.offset = window.offset + 25;
            }else{
                window.offset = 0;
            }
            d.forEach(function(k) {
                userIds.push(k.userId);
                $('#containingItemsDiv').append('<div class="col-sm-12 col-md-6 col-lg-3"><div class="card" style="margin: 1rem 0px;"><img style="width:100%;" data-userid="'+k.userId+'" /> <div class="card-body"><div class="card-title text-left text-truncate" style="margin-bottom:0;"><a href="/users/'+k.userId+'/profile" data-userid="'+k.userId+'"></a></div><div class="row"><div class="col-sm-6"><button type="button" class="btn btn-success acceptFriendRequest" style="margin:0auto;display:block;width: 100%;" data-userid="'+k.userId+'">Accept</button></div><div class="col-sm-6"><button type="button" data-userid="'+k.userId+'" class="btn btn-danger declineFriendRequest" style="margin:0auto;display:block;width: 100%;">Decline</button></div></div></div></div></div>');
            });
            setUserNames(userIds);
            setUserThumbs(userIds);
        })
        .catch(function(e) {
            if (window.offset === 0) {
                $('#containingItemsDiv').append('<div class="col-sm-12"><h5 class="text-center" style="margin-top:1rem;">You do not have any friend requests.</h5></div>');
            }
        });
}
function loadMessages() {
    $('.loadMoreItems').hide();
    request("/notifications/messages?offset="+window.offset, "GET")
        .then(function(d) {
            // $('#containingItemsDiv').empty();
            if (d.length <= 0) {
                if (window.offset === 0) {
                    $('#containingItemsDiv').append('<div class="col-sm-12"><h5 class="text-center" style="margin-top:1rem;">You do not have any messages.</h5></div>');
                }
            }
            var userIds =[];
            if (window.offset === 0) {
                $('#containingItemsDiv').append(`<div class="col-12"><table class="table">
                <thead>
                    <tr>
                        <th scope="col">From</th>
                        <th scope="col">Subject</th>
                        <th scope="col">Date</th>
                    </tr>
                </thead>
                <tbody id="messagesFromDiv"></tbody></table></div>`);
            }
            d.forEach(function(k) {
                userIds.push(k.userId);
                if (k.read === 0) {
                    $('#messagesFromDiv').append('<tr data-id="'+k.messageId+'" data-userid="'+k.userId+'" style="cursor: pointer;" class="onClickShowMessage" data-msgbody="'+k.body.escape()+'"><th scope="row"><p data-userid="'+k.userId+'"></p></th><th scope="row">'+k.subject.escape()+'</th><th scope="row">'+formatDate(k.date)+'</th></tr>');
                }else{
                    $('#messagesFromDiv').append('<tr data-userid="'+k.userId+'" style="cursor: pointer;" class="onClickShowMessage" data-msgbody="'+k.body.escape()+'"><td scope="row"><p data-userid="'+k.userId+'"></p></tdt><td scope="row">'+k.subject.escape()+'</td><td scope="row">'+formatDate(k.date)+'</td></tr>');
                }
            });
            setUserNames(userIds);
            if (d.length >= 25) {
                $('.loadMoreItems').show();
                window.offset = window.offset + 25;
            }else{
                window.offset = 0;
            }
        })
        .catch(function(e) {
            $('#containingItemsDiv').empty();
            if (window.offset === 0) {
                $('#containingItemsDiv').append('<div class="col-sm-12"><h5 class="text-center" style="margin-top:1rem;">You do not have any messages.</h5></div>');
            }
        });
}

$(document).on('click', '.goBackButton', function() {
    $('#containingItemsDiv').empty();
    $('.goBackButton').hide();
    window.offset = 0;
    loadMessages();
});

$(document).on('click', '.onClickShowMessage', function() {
    var msg = $(this).attr("data-msgbody");
    var userid = $(this).attr("data-userid");
    var id = $(this).attr("data-id");
    if ($('#messagesFromDiv').find('.messageDisplay').length) {
        /*
        console.log("find")
        $('#messagesFromDiv').find('.messageDisplay').remove();
        $(this).children().each(function () {
            $(this).replaceWith(function () {
                console.log('replace');
                return "<td>" + $(this).html() + "</td>";
            });
        });
        */
    }else{
        $("html, body").animate({ scrollTop: 0 }, "medium");
        $(this).parent().parent().empty();
        $('#containingItemsDiv').append('<div class="messageDisplay"><div class="row"><div class="col-3 col-md-2 col-lg-1"><img style="width:100%" data-userid='+userid+' /></div><div class="col"><p style="white-space:pre-wrap;">'+msg.escape()+'</p></div></div></div>');
        $('.loadMoreItems').hide();
        $('.goBackButton').show();
        setUserThumbs([userid]);
        if ($(this).find('th').length) {
            request("/notifications/message/"+id+"/read", "PATCH")
                .then(function(d) {

                })
                .catch(function(e) {

                });
        }
    }
})