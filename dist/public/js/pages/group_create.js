request('/group/metadata/creation-fee', 'GET').then(fee => {
    $('#group-cost').html(`${formatCurrency(1,'1rem')} `+number_format(fee.cost))
});

$(document).on('click', '#createGroupClick', function() {
    $(this).attr('disabled','disabled');
    //var form = $('#assetsForm')[0];
    //var data = new FormData(form);
    var form = new FormData(); 
    if (typeof $('#textureFile')[0].files[0] !== "undefined") {
        form.append("png", $('#textureFile')[0].files[0]);
    }else{
        warning("A Group Logo is required. Please select one, and try again");
        $(this).removeAttr('disabled');
        return;
    }
    if (typeof $('#groupName').val() === "undefined" || $('#groupName').val() === null || $('#groupName').val() === "") {
        warning("Please enter a name, then try again.");
        $(this).removeAttr('disabled');
        return;
    }
    form.append("name", $('#groupName').val());
    form.append("description", $('#groupDescription').val());
    makeAsset(form, "fetch");
});
function makeAsset(form, csrf) {
    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: "/api/v1/group/create",
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
                window.location.href = "/groups/"+data.id+"/"
            }else{
                $(this).removeAttr('disabled');
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
                $(this).removeAttr('disabled');
                if (e.responseJSON && e.responseJSON.message) {
                    warning(e.responseJSON.message);
                }else{
                    warning("An unknown error has occured. Try reloading the page, and trying again.");
                }
            }
        }
    });
}