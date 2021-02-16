var profileData = $('#profiledata');
var userid = profileData.attr("data-userid");
window.invOffset = 0;
loadInventory(0);
$(document).on('click', '.loadMoreItems', function() {
    loadInventory(window.invOffset);
});
function loadInventory(offset) {
    request("/user/"+userid+"/friends?limit=100&offset="+offset)
    .then(function(d) {
        $('#friendCountDiv').html('('+d.total+')');
        if (d["friends"].length <= 0) {
            if (offset === 0) {
                $('#userFriendsDiv').html('<h5>This user does not have any friends.</h5>');
            }
        }else{
            var userIdsRequest = [];
            $.each(d["friends"], function(index, value) {
                $('#userFriendsDiv').append('<div class="col-sm-4 col-md-3 col-lg-2 userFriend" style="padding:0.25rem;margin-bottom:0;"><div class="card" style="display:none;"><img style="width:100%;" data-userid="'+value.userId+'" /> <div class="card-body"><div class="card-title text-left text-truncate" style="margin-bottom:0;"><a href="/users/'+value.userId+'/profile"><span data-userid="'+value.userId+'"></span></a></div></div></div></div>');
                userIdsRequest.push(value.userId);
            });
            setUserThumbs(userIdsRequest);
            setUserNames(userIdsRequest);
        }
        if (d["friends"].length >= 100) {
            window.invOffset = window.invOffset + 100;
            $('.loadMoreItems').css("display", "block")
        }else{
            $('.loadMoreItems').hide();
        }
    })
    .catch(function(e) {
        console.log(e);
        if (offset === 0) {
            $('#userFriendsDiv').html('<div class="col sm-12"><h5 class="text-center">This user does not have any friends.</h5></div>');
        }
    });
}