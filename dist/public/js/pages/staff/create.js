$(document).on('click', '#createAssetClick', function() {
    $('#createAssetClick').attr('disabled','disabled');
    loading();
    //var form = $('#assetsForm')[0];
    //var data = new FormData(form);
    var form = new FormData(); 
    if (typeof $('#objFile')[0].files[0] !== "undefined") {
        form.append("obj", $('#objFile')[0].files[0]);
    }else{
        //warning("An OBJ file is required. Please select one, and try again");
        //return;
    }
    if (typeof $('#mtlFile')[0].files[0] !== "undefined") {
        form.append("mtl", $('#mtlFile')[0].files[0]);
    }else{
        //warning("An MTL file is required. Please select one, and try again");
        //return;
    }
    if (typeof $('#textureFile')[0].files[0] !== "undefined") {
        form.append("png", $('#textureFile')[0].files[0]);
    }
    form.append("name", $('#assetName').val());
    form.append("category", $('#assetCategory').val());
    form.append("price", $('#assetPrice').val());
    form.append("currency", $('#assetCurrency').val());
    form.append("description", $('#assetDescription').val());
    form.append("is_collectible", $('#assetIsCollectible').val());
    form.append("stock", $('#assetStock').val());
    form.append("isForSale", $('#assetForSale').val());
    form.append("uploadAsStaff", true);
    makeAsset(form, "fetch");
});
function makeAsset(form, csrf) {
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: HTTPMeta.baseUrl+"/api/v1/catalog/create",
        headers:{
            "x-csrf-token": csrf,
            'accept': 'application/json',
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
                console.log(e);
                var head = e.getResponseHeader("x-csrf-token");
                console.log(head);
                if (typeof head !== "undefined") {
                    return makeAsset(form, head);
                }else{
                    console.log("bad");
                }
            }else{
                $('#createAssetClick').removeAttr('disabled');
                if (e.responseJSON && e.responseJSON.error && e.responseJSON.error.code) {
                    warning(errorTransform(e.responseJSON.error.code));
                }else{
                    warning("An unknown error has ocurred");
                }
            }
        }
    });
}