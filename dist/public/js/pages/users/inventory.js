var profileData = $('#profiledata');
var userid = profileData.attr("data-userid");
window.invOffset = {};

loadInventory(1);
$(document).on('click', '.loadMoreItems', function() {
    loadInventory(window.defaultcategory, window.invOffset[window.defaultcategory]);
});
$(document).on('click', '.openInventoryPage', function() {
    $('#userInventoryDiv').empty();
    loadInventory(parseInt($(this).attr("data-id")), 0);
    window.invOffset[parseInt($(this).attr("data-id"))] = 0;
});

function loadInventory(category, offset) {
    if (typeof offset === "undefined") {
        offset = 0;
    }
    window.defaultcategory = category;
    request("/user/"+userid+"/inventory?limit=100&offset="+offset+"&category="+category)
    .then(function(d) {
        d=d.items;
        if (d.length <= 0) {
            if (offset === 0) {
                $('#userInventoryDiv').html('<div class="col sm-12" style="margin-top:1rem;"><h5 class="text-center">This user does not have any items in this category.</h5></div>');
            }
        }else{
            var catalogIdsRequest = [];
            $.each(d, function(index, value) {
                if (value.serial !== null) {
                    value.serial = "<p>Serial: #"+value.serial.toString()+"</p>";
                }else{
                    value.serial = "<p>Serial: N/A</p>";
                }
                $('#userInventoryDiv').append('<div class="col-sm-4 col-md-3 col-lg-2 userInventoryItem" data-catalogid="'+value.catalogId+'"><div class="card" style="margin: 1rem 0;display:none;"><img data-catalogid="'+value.catalogId+'" style="width:100%;" /> <div class="card-body"><div class="card-title text-left text-truncate" style="margin-bottom:0;"><a href="/catalog/'+value.catalogId+'/">'+value.catalogName.escape()+'</a>'+value.serial+'</div></div></div></div>');
                //$('#userInventoryDiv').append('<div style="display:none;" class="col-sm-2" id="user_inventory_item_'+index+'"><img style="width:100%;" /><a style="color:#212529;" href="/catalog/'+value.catalogId+'/"><p class="text-center text-truncate">'+value.name+'</p></a></div>');
                catalogIdsRequest.push(value.catalogId);
            });
            setCatalogThumbs(catalogIdsRequest);
        }
        if (d.length >= 100) {
            if (typeof window.invOffset[category] === "undefined") {
                window.invOffset[category] = 0;
            }
            window.invOffset[category] = window.invOffset[category] + 100;
            $('.loadMoreItems').css("display", "block")
        }else{
            $('.loadMoreItems').hide();
        }
    })
    .catch(function(e) {
        console.log(e);
        if (offset === 0) {
            $('#userInventoryDiv').html('<div class="col sm-12" style="margin-top:1rem;"><h5 class="text-center">This user does not have any items in this category.</h5></div>');
        }
    });
}