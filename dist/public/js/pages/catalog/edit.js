$(document).on('click', '#editAssetClick', function() {
    var currency = parseInt($('#assetCurrency').val());
    var price = parseInt($('#assetPrice').val());
    var name = $('#assetName').val();
    var desc = $('#assetDescription').val();
    var stock = $("#assetStock").val();
    var isForSale = parseInt($('#isForSale').val());
    var moderationLevel = parseInt($('#moderation').val());
    var cat = $('#category').val();
    if (isNaN(moderationLevel)) {
        moderationLevel = 0;
    }
    if (stock !== null) {
        stock = parseInt(stock);
    }
    var collectible = $("#assetIsCollectible").val();
    if (collectible !== null) {
        collectible = parseInt(collectible);
        if (stock !== null && stock !== 0 && isNaN(stock) === false) {
            collectible = 1;
        }
    }
    console.log(collectible);
    request("/catalog/"+$('#catalogdata').attr("data-id")+"/info", "PATCH", JSON.stringify({name:name,description:desc,price:price,currency:currency,stock:stock,collectible:collectible,isForSale:isForSale,moderation:moderationLevel,category: parseInt(cat, 10)}))
        .then((d) => {
            success("This item has been updated!", function() {
                window.location.href = "/catalog/"+$('#catalogdata').attr("data-id");
            });
        })
        .catch((e) => {
            console.log(e);
            if (!e.responseJSON.message) {
                e.responseJSON.message = "This item count not be updated. Please try again.";
            }
            warning(e.responseJSON.message);
        })
});

$(document).on('click', '#updateAssetTexturesClick', function() {
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
    updateAssetFiles(form, "fetch");
});

function updateAssetFiles(form, csrf) {
    $.ajax({
        xhrFields: {
            withCredentials: true
        },
        type: "PATCH",
        enctype: 'multipart/form-data',
        url: HTTPMeta.baseUrl+"/api/v1/catalog/"+$('#catalogdata').attr("data-id")+"/files",
        headers:{
            "x-csrf-token": csrf,
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
                    return updateAssetFiles(form, head);
                }else{
                    console.log("bad");
                }
            }else{
                warning(e.responseJSON.message);
            }
        }
    });
}