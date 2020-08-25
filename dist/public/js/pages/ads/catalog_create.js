$(document).on('click', '#createAdClick', function(e) {
    e.preventDefault();
    if (typeof $('#imageFile')[0].files[0] === "undefined") {
        warning("A image file is required. Please select one, and try again");
        return;
    }
    let title = $('#adName').val() || '';
    loading();
    var form = new FormData(); 
    form.append("file", $('#imageFile')[0].files[0]);
    form.append("title", title);
    form.append('adType', 1);
    form.append('adRedirectId', $('#catalogid').val());
    form.append('adDisplayType', $('#adDisplayType').val());
    makeAsset(form, "fetch");
});

function makeAsset(form, csrf) {
    $.ajax({
        xhrFields: {
            withCredentials: true
        },
        type: "POST",
        enctype: 'multipart/form-data',
        url: HTTPMeta.baseUrl+"/api/v1/ad/create",
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
            success('Your ad has been created', () => {
                window.location.href = '/ads';
            });
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
                if (e.responseJSON && e.responseJSON.message) {
                    warning(e.responseJSON.message);
                }else{
                    warning("An unknown error has occured. Try reloading the page, and trying again.");
                }
            }
        }
    });
}
