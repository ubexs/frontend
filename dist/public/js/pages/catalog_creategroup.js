var groupdata = $('#groupdata');
window.history.replaceState(null, null, "/groups/"+groupdata.attr("data-groupid")+"/"+groupdata.attr("data-encoded-name")+"/create");

$(document).on('click', '#createAssetClick', function() {
    //var form = $('#assetsForm')[0];
    //var data = new FormData(form);
    var form = new FormData(); 
    if (typeof $('#textureFile')[0].files[0] !== "undefined") {
        form.append("png", $('#textureFile')[0].files[0]);
    }else{
        warning("A PNG Texture file is required. Please select one, and try again");
        return;
    }
    if (typeof $('#assetName').val() === "undefined" || $('#assetName').val() === null || $('#assetName').val() === "") {
        warning("Please enter a name, then try again.");
        return;
    }
    let price = $('#assetPrice').val();
    if (!price) {
        price = 0;
    }
    console.log(price);
    loading();
    form.append("name", $('#assetName').val());
    form.append("category", $('#assetCategory').val());
    form.append("price", price);
    form.append("currency", $('#assetCurrency').val());
    form.append("description", $('#assetDescription').val());
    form.append("isForSale", parseInt($('#assetForSale').val()));
    form.append("uploadAsStaff", false);
    form.append("groupId", parseInt($('#groupdata').attr("data-groupid")));
    makeAsset(form, "fetch");
});
function makeAsset(form, csrf) {
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "/api/v1/catalog/create",
        headers:{
            "x-csrf-token": csrf,
            "accept": 'application/json',
        },
        data: form,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        success: function (data) {
            if (data.id) {
                window.location.href = "/catalog/"+data.id+"/"
            }
        },
        error: function (e) {
            if (e.status === 403) {
                var head = e.getResponseHeader("x-csrf-token");
                if (typeof head !== "undefined") {
                    return makeAsset(form, head);
                }else{
                    console.log("bad");
                }
            }else{
                if (e.responseJSON && e.responseJSON.error) {
                    warning(errorTransform(e.responseJSON.error.code));
                }else{
                    warning("An unknown error has occured. Try reloading the page, and trying again.");
                }
            }
        }
    });
}

let isForSale = false;
$(document).on('click', '#assetForSale', function(e) {
    e.preventDefault();
    const option = parseInt($(this).val(), 10);
    if (option === 0) {
        $('.item-for-sale-info').hide();
    }else if (option === 1) {
        $('.item-for-sale-info').show();
    }
});