var curDisplay = "";
var partnerUserId = 1;
var knownUsersArray = {};
var pendingUsers = {};
function userIdToName(userid) {
    if (typeof knownUsersArray[userid] !== "undefined" && knownUsersArray[userid] !== null) {
        return knownUsersArray[userid];
    }else{
        if (typeof pendingUsers[userid] !== "undefined" && pendingUsers[userid] !== null) {
        }else{
            pendingUsers[userid] = "pending";
            request("/user/"+userid+"/info", "GET")
                .then(function(udata) {
                    knownUsersArray[userid] = udata.username;
                })
                .catch(function(e) {
                    console.log(e);
                    pendingUsers[userid] = null;
                });
        }
        return "";
    }
}

var userid = $('#userdata').attr("data-userid");
$('#transactionsBodyDisplay').parent().parent().append('<button type="button" class="btn btn-small btn-success loadMoreButtonClick" style="margin:0 auto;display: hidden;">Load More</button>');
function loadTrades(type, offset) {
    $('#tradesGrid').empty();
    $('.loadMoreButtonClick').hide();
    request("/economy/trades/"+type+"/?offset="+offset, "GET")
        .then(function(data) {
            if (data.length <= 0) {
                $('#tradesGrid').append("<div class='col-sm-12'><p class='text-center' style='margin-top:1rem;'>There are no trades to display!</p></div>");
                return;
            }
            var userThumbsArr = [];
            $.each(data, function(key, value) {
                partnerUserId = value.userId;
                userThumbsArr.push(partnerUserId);
                $('#tradesGrid').append(`
                    <div class="col-6 col-sm-12 col-lg-6" style="margin-top:1rem;">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-4">
                                        <a href="/users/${partnerUserId}/profile">
                                            <img data-userid="`+partnerUserId+`" style="width:100%;" />
                                        </a>
                                    </div>
                                    <div class="col-8">
                                        <p style="font-size: small;" class="text-truncate">From <a href="/users/${partnerUserId}/profile"><span data-userid="${partnerUserId}" class="font-weight-bold">Loading...</span></a></p>
                                        <p style="font-size: small;" class="text-truncate">${moment(value.date).fromNow()}</p>
                                        <button type="button" class="btn btn-outline-success reviewTradeData" data-type="`+type+`" data-tradeid=`+value.tradeId+` data-useridone="`+value.userId+`" data-useridtwo="`+userId+`" data-date="`+formatDate(value.date)+`" style="width:100%;padding-bottom:0.25rem;padding-top:0.25rem;font-size:0.75rem;" data-offer-primary="${value.offerPrimary}" data-request-primary="${value.requestPrimary}">Review</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `)
            });
            setUserThumbs(userThumbsArr);
            setUserNames(userThumbsArr);
            if (data.length >= 25) {
                if (parseInt(window["trans_offset_"+type]) === null) {
                    window["trans_offset_type"] = 0;
                }
                window["trans_offset_"+type] = window["trans_offset_type"] + 25;;
                $('.loadMoreButtonClick').css("display", "block");
            }else{
                $('.loadMoreButtonClick').hide();
            }
        })
        .catch(function(e) {
            console.error(e);
            $('#tradesGrid').append("<div class='col-sm-12'><p class='text-center' style='margin-top:1rem;'>There are no trades to display!</p></div>")
        });
}
loadTrades("inbound", 0);
$(document).on('click', '.openTrades', function() {
    var type = $(this).html().toLowerCase();
    loadTrades(type, 0);
})

$(document).on('click', '.reviewTradeData', function() {
    $('#tradesGrid').children().each(function() {
        $(this).css('opacity','1');
    });
    $(this).parent().parent().parent().parent().parent().css('opacity','0.25');
    $('#current-trade-card-body').empty();
    $('#current-trade-card-body').append(`
    <div class="row">
        <div class="col-12">
            <div class="spinner-border" role="status" style="margin:0 auto;display:block;"></div>
        </div>
    </div>
    `);
    var id = parseInt($(this).attr("data-tradeid"));
    var image = $(this).parent().parent().find("img").attr("src")
    var type = $(this).attr("data-type");
    var date = $(this).attr("data-date");
    var partnerUserId = parseInt($(this).attr("data-useridone"));

    var offerPrimary = parseInt($(this).attr('data-offer-primary'));
    var requestPrimary = parseInt($(this).attr('data-request-primary'));
    // Get Data with Catalog Info
    request("/economy/trades/"+id+"/items", "GET")
        .then(function(d) {
            var itemsToGiveHtml = ``;
            var itemsToRecieveHtml = ``;
            // var partnerUserId = 0;
            var itemsRecevMessage = "";
            var itemsGiveMessage = "";
            var confirmText = "";
            var showCancel = true;
            var side = 1;
            var catalogThumbsArr = [];
            var offerASP = offerPrimary;
            d["offer"].forEach(function(v) {
                offerASP+= v.averageSalesPrice;
                let serialText = '<p style="font-size:0.65rem;text-align:left;">Serial: N/A</p>';
                if (v.serial) {
                    serialText = '<p style="font-size:0.65rem;text-align:left;">Serial: '+v.serial+'</p>';
                }
                itemsToGiveHtml += '<div class="col-3 col-sm-3 col-md-3"><a href="/catalog/'+v["catalogId"]+'" target="_blank"><img data-catalogid="'+v["catalogId"]+'" style="width: 100%;" /></a><p class="text-truncate" style="font-size: 0.75rem;font-weight:700;text-align:left;" data-catalogid="'+v.catalogId+'">Loading</p>'+serialText+'</div>';
                catalogThumbsArr.push(v["catalogId"]);
            });
            var requestASP = requestPrimary;
            d["requested"].forEach(function(v) {
                requestASP+=v.averageSalesPrice;
                let serialText = '<p style="font-size:0.65rem;text-align:left;">Serial: N/A</p>';
                if (v.serial) {
                    serialText = '<p style="font-size:0.65rem;text-align:left;">Serial: '+v.serial+'</p>';
                }
                itemsToRecieveHtml += '<div class="col-3 col-sm-3 col-md-3"><a href="/catalog/'+v["catalogId"]+'" target="_blank"><img data-catalogid="'+v["catalogId"]+'" style="width: 100%;" /></a><p class="text-truncate" style="font-size: 0.75rem;font-weight:700;text-align:left;" data-catalogid="'+v.catalogId+'">Loading</p>'+serialText+'</div>';
                catalogThumbsArr.push(v["catalogId"]);
            });
            if (type === "outbound") {
                itemsRecevMessage = "Items you will Recieve";
                itemsGiveMessage = "Items you will Give";
                confirmText = "Close";
                showCancel = true;
            }else if (type === "inactive") {
                showCancel = false;
                itemsRecevMessage = "Items you would have Recieved";
                itemsGiveMessage = "Items you would have Given";
                confirmText = "Close";
            }else if (type === "inbound") {
                showCancel = true;
                itemsRecevMessage = "Items you will Recieve";
                itemsGiveMessage = "Items you will Give";
                confirmText = "Accept Trade";
            }else if (type === "completed") {
                showCancel = false;
                itemsRecevMessage = "Items you Recieved";
                itemsGiveMessage = "Items you Gave";
                confirmText = "Close";
            }
            let extraOfferMessage = '';
            if (offerPrimary) {
                extraOfferMessage = `(+${formatCurrency(1, '0.75rem')} ${number_format(offerPrimary)})`;
            }
            let extraRequestMessage = '';
            if (requestPrimary) {
                extraRequestMessage = `(+${formatCurrency(1, '0.75rem')} ${number_format(requestPrimary)})`;
            }
            $('#current-trade-card-body').empty();
            let cancelButton = '';
            if (showCancel) {
                cancelButton = `<button type="button" class="btn btn-danger modify-trade-state" style="width:100%;" data-dismiss="true">Cancel Trade</button>`;
            }
            $('#current-trade-card-body').append(`
            
            <div class="row">
                <div class="col-2">
                    <img src="${window.subsitutionimageurl}" style="width:100%;height:auto;display:block;margin:0 auto;" data-userid="${partnerUserId}" />
                </div>
                <div class="col-10">
                    <h5>Trade with <span class="font-weight-bold" data-userid="${partnerUserId}">Loading...</span></h5>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <hr />
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <h5 style="">${itemsGiveMessage}</h5>
                    <p style="font-size:0.75rem;">Total Value: ${number_format(offerASP)} ${extraRequestMessage}</p>
                    <div class="row">
                        ${itemsToGiveHtml}
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <hr />
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <h5 style="">${itemsRecevMessage}</h5>
                    <p style="font-size:0.75rem;">Total Value: ${number_format(requestASP)} ${extraOfferMessage}</p>
                    <div class="row">
                        ${itemsToRecieveHtml}
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top:1rem;">
                <div class="col-6">
                    <button type="button" class="btn btn-outline-success modify-trade-state" style="width:100%;" data-accept="true">${confirmText}</button>
                </div>
                <div class="col-6">
                    ${cancelButton}
                </div>
            </div>
            
            `);
            setUserNames([partnerUserId]);
            setUserThumbs([partnerUserId]);
            setCatalogThumbs(catalogThumbsArr);
            setCatalogNames(catalogThumbsArr);
            let hideTradeBtn = () => {
                $('#tradesGrid').children().each(function() {
                    $(this).css('opacity','1');
                });
            }
            $(document).on('click', '.modify-trade-state', function(e) {
                let d = {
                    dismiss: $(this).attr('data-dismiss') === 'true' ? 'cancel' : false,
                    value: $(this).attr('data-accept') === 'true' ? true : false,
                }
                e.preventDefault();
                if (type === "outbound") {
                    if (d.dismiss && d.dismiss === "backdrop") {

                    }else if (d.dismiss && d.dismiss === "cancel") {
                        questionYesNo("Are you sure you want to cancel this trade?", function() {
                            loading();
                            $(this).off();
                            $('#current-trade-card-body').empty();
                            hideTradeBtn();
                            request("/economy/trades/"+id, "DELETE")
                                .then(function(d) {
                                    success("The trade has been deleted", function() {
                                        loadTrades(type, 0);
                                    });
                                })
                                .catch(function(e) {
                                    console.log(e);
                                    warning(e.responseJSON.message);
                                });
                        })
                    }else if (d.value) {
                        $(this).off();
                        $('#current-trade-card-body').empty();
                        hideTradeBtn();
                    }                    
                }
                if (type === "inbound") {
                    if (d.dismiss && d.dismiss === "backdrop") {

                    }else if (d.dismiss && d.dismiss === "cancel") {
                        questionYesNo("Are you sure you want to cancel this trade?", function() {
                            loading();
                            $(this).off();
                            $('#current-trade-card-body').empty();
                            hideTradeBtn();
                            request("/economy/trades/"+id, "DELETE")
                                .then(function(d) {
                                    success("The trade has been deleted", function() {
                                        loadTrades(type, 0);
                                    });
                                })
                                .catch(function(e) {
                                    console.log(e);
                                    warning(e.responseJSON.message);
                                });
                            });
                    }else if (d.value) {
                        questionYesNo("Are you sure you want to accept this trade?", function() {
                            loading();
                            $(this).off();
                            $('#current-trade-card-body').empty();
                            hideTradeBtn();
                            request("/economy/trades/"+id, "POST")
                                .then(function(d) {
                                    success("The trade has been accepted! You can view your new item(s) in your inventory.", function() {
                                        loadTrades(type, 0);
                                    });
                                })
                                .catch(function(e) {
                                    console.log(e);
                                    warning(e.responseJSON.message);
                                });
                        })
                    }  
                }
            });
            /*
            Swal.fire({
                title: 'Review Trade',
                html:
                  `<div class="row">
                  <div class="col-6 col-md-4"><img data-userid="`+partnerUserId+`" style="width:100%;" /><h5><a href="/users/`+partnerUserId+`/profile" target="_blank">`+userIdToName(partnerUserId)+`</a></h5><p style="font-size: 0.75em;">`+date+`</p></div>
                  <div class="col-6 col-md-8">
                  <h5 style="">`+itemsGiveMessage+`</h5>
                  <p style="font-size:0.75rem;">Total Value: ${number_format(offerASP)} ${extraRequestMessage}</p>
                  <div class="row">
                    `+itemsToGiveHtml+`
                  </div>
                  <h5 style="margin-top:1rem;">`+itemsRecevMessage+`</h5>
                  <p style="font-size:0.75rem;">Total Value: ${number_format(requestASP)} ${extraOfferMessage}</p>
                  <div class="row">
                    `+itemsToRecieveHtml+`
                  </div>
                  </div>
                  </div>`,
                showCloseButton: true,
                showCancelButton: showCancel,
                focusConfirm: false,
                confirmButtonText:confirmText,
                cancelButtonText:'Cancel Trade',
            }).then(function(d) {
                if (type === "outbound") {
                    if (d.dismiss && d.dismiss === "backdrop") {

                    }else if (d.dismiss && d.dismiss === "cancel") {
                        questionYesNo("Are you sure you want to cancel this trade?", function() {
                            loading();
                            request("/economy/trades/"+id, "DELETE")
                                .then(function(d) {
                                    success("The trade has been deleted", function() {
                                        loadTrades(type, 0);
                                    });
                                })
                                .catch(function(e) {
                                    console.log(e);
                                    warning(e.responseJSON.message);
                                });
                        })
                    }else if (d.value) {

                    }                    
                }
                if (type === "inbound") {
                    if (d.dismiss && d.dismiss === "backdrop") {

                    }else if (d.dismiss && d.dismiss === "cancel") {
                        questionYesNo("Are you sure you want to cancel this trade?", function() {
                            loading();
                            request("/economy/trades/"+id, "DELETE")
                                .then(function(d) {
                                    success("The trade has been deleted", function() {
                                        loadTrades(type, 0);
                                    });
                                })
                                .catch(function(e) {
                                    console.log(e);
                                    warning(e.responseJSON.message);
                                });
                            });
                    }else if (d.value) {
                        questionYesNo("Are you sure you want to accept this trade?", function() {
                            loading();
                            request("/economy/trades/"+id, "POST")
                                .then(function(d) {
                                    success("The trade has been accepted! You can view your new item(s) in your inventory.", function() {
                                        loadTrades(type, 0);
                                    });
                                })
                                .catch(function(e) {
                                    console.log(e);
                                    warning(e.responseJSON.message);
                                });
                        })
                    }  
                }
            })
            */
        })
        .catch(function(e) {
            console.log(e);
            warning("This trade does not seem to exist. Please reload the page, and try again.");
        });
});