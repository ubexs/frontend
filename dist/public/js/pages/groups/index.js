window.searchOffset = 0;
search("", 0);
function search(q, offset) {
    $('#userSearchResultsDiv').children().each(function(k) {
        $(this).css("opacity", 0.5)
    })
    request("/group/search?limit=25&name="+q+"&offset="+offset)
    .then(function(d) {
        // $('#groupSearchResultsDiv').empty();
        var groupIdThumbs = [];
        d.forEach(function(k) {
            $('#groupSearchResultsDiv').append(`
            <div class="col-sm-12">
                <div class="card">
                    <div class="card-body groupChangeBgOnHover">
                        <div class="row">
                            <div class="col-sm-2">
                                <a href="/groups/`+k.groupId+`/`+urlencode(k.groupName)+`">
                                    <img src="`+window.subsitutionimageurl+`" data-catalogid="`+k.groupIconCatalogId+`" style="width:100%;border-radius:15%;" />
                                </a>
                            </div>
                            <div class="col-sm-6">
                                <a href="/groups/`+k.groupId+`/`+urlencode(k.groupName)+`"><h5>`+k.groupName.escape()+`</h5></a>
                                <p><span style="font-weight:600;">Description: </span>`+k.groupDescription.escape()+`</p>
                                <p><span style="font-weight:600;">Members: </span>`+nform(k.groupMemberCount)+`</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`)
            groupIdThumbs.push(k.groupIconCatalogId);
        });
        if (d.length >= 25) {
            window.searchOffset = window.searchOffset + 25;
            $('.loadMoreGroups').show();
        }else{
            window.searchOffset = 0;
            $('.loadMoreGroups').hide();
        }
        if (d.length <= 0) {
            $('#userSearchResultsDiv').append('<div class="col-12"><h3 class="text-center" style="margin-top:1rem;">Your search query returned 0 results.</h3></div>');
        }
        setCatalogThumbs(groupIdThumbs);
    })
    .catch(function(e) {
        console.log(e);
    })
}

$(document).on("click", "#searchForGroupClick", function() {
    var query = $('#searchForGroupInput').val();
    window.searchOffset = 0;
    $('#groupSearchResultsDiv').empty();
    search(query, 0);
});
$(document).on('click', '.loadMoreGroups', function() {
    var query = $('#searchForGroupInput').val();
    search(query, window.searchOffset);
})