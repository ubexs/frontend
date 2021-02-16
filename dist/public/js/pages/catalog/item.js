window.commentsOffset = 0;
window.ownersOffset = 0;
var userData = $('#userdata');
var catalogdata = $('#catalogdata');
var catalogid = catalogdata.attr("data-id");
var userid = $('#userdata').attr("data-userid");
/*
var urlencname = catalogdata.attr("data-name");
urlencname = urlencname.replace(/\s| /g, '-');
urlencname = urlencname.replace(/[^a-zA-Z\d-]+/g, '');
urlencname = urlencname.replace(/--/g, '-');
*/
// urlencname = catalogdata.attr("data-name").replace(/--/g, '');
// urlencname = encodeURIComponent(urlencname);
window.history.replaceState(null, null, catalogdata.attr("data-encoded-name"));

request("/user/"+catalogdata.attr("data-creatoruserid")+"/info", "GET")
    .then(function(d) {
        if (catalogdata.attr("data-creatortype") === "1") {
            request("/group/"+catalogdata.attr("data-creatorid")+"/info", "GET")
                .then(function(group) {
                    $('#createdByP').html('<span style="font-weight:600;">Created By:</span> <a href="/users/'+catalogdata.attr("data-creatoruserid")+'/profile">'+d.username+'</a> <a href="/groups/'+group.groupId+'/'+urlencode(group.groupName)+'/">('+group.groupName.escape()+')</a>');
                })
                .catch(function(e) {

                })
        }else{
            $('#createdByP').html('<span style="font-weight:600;">Created By:</span> <a href="/users/'+catalogdata.attr("data-creatoruserid")+'/profile">'+d.username+'</a>');
        }
    })
    .catch(function(e) {
        console.log(e);
    });

if ($('.formatNumber').length) {
    $('.formatNumber').each(function() {
        var a = $(this);
        $(this).html(formatCurrency(parseInt(a.attr("data-currency"))) + " " + nform(parseInt(a.attr("data-price"))));
    })
}

// Check if Owns
var itemsUserOwns = [];
if (userData.attr("data-authenticated") === "true") {
    request("/user/"+userid+"/owns/"+catalogid)
        .then(function(d) {
            if (catalogdata.attr("data-collectible") === "1" && catalogdata.attr("data-isforsale") === "0") {
                if (typeof d[0] !== "undefined") {
                    var ok = true;
                    $.each(d, function(index, value) {
                        if (value["price"] <= 0) {
                            itemsUserOwns.push(value);
                        }
                        if (ok) {
                            if (value["price"] <= 0) {
                                $('#onClickSellitem').show();
                                $('#onClickSellitem').attr("uid", value["userInventoryId"]);
                                ok = false;
                            }
                        }
                    });
                }
            }else if (catalogdata.attr("data-isforsale") === "1" && typeof d.length > 0) {
                $('.primaryPurchaseButton').attr("disabled", "disabled");
                $('.primaryPurchaseButton').html("You already own this item.");
            }else{
                if (d.length > 0) {
                    // Hide Buy Button
                    $('.primaryPurchaseButton').attr("disabled", "disabled");
                    $('.primaryPurchaseButton').html("You already own this item.");
                    $('#onClickDeleteItem').show();
                }
            }
        })
        .catch(function(e) {
            console.log(e);

        });
}else{
    $('#commentOnCatalogItem').hide();
}

if ($('#itemPriceFirstParty').length) {
    var currency = parseInt($('#itemPriceFirstParty').attr("data-currency"));
    var amt = parseInt($('#itemPriceFirstParty').html());
    $('#itemPriceFirstParty').html(formatCurrency(currency)+nform(amt))
}
window.commentsLoading = false;
$(window).on("scroll", function() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        if (window.commentsOffset >= 25 && window.commentsLoading === false) {
            console.log("load comments");
            loadComments();
        }
    }
});

$(document).on('click', '#submitCatalogComment', function() {
    var comment = $('#catalogCommentText').val();
    if (comment.length >= 6 && comment.length <= 499) {
        postComment(comment);
    }else{
        toast(false, "Your comment must be between 5 and 500 characters.");
    }
});

function postComment(comment) {
    window.commentsOffset = 0;
    var response = grecaptcha.getResponse();
    request("/catalog/"+catalogid+"/comment", "POST", JSON.stringify({"comment":comment,captcha:response}))
        .then(function(d) {
            console.log(d);
            $("#catalogCommentsContainer").empty();
            loadComments();
            toast(true, "Your comment has been posted.");
            grecaptcha.reset();
        })
        .catch(function(e) {
            console.log(e);
            toast(false, e.responseJSON.message);
            grecaptcha.reset();
        });
}

// Get Comments
loadComments();
function loadComments(){
    window.commentsLoading = true;
    request("/catalog/"+catalogid+"/comments?limit=25&offset="+window.commentsOffset, "GET")
        .then(function(d) {
            if (d.length <= 0 && window.commentsOffset === 0) {
                $('#catalogCommentsContainer').append('<p style="white-space: pre-wrap; margin-bottom: 0px;">Nobody has commented anything yet.</p>');
            }else{
                var avatars = [];
                d.forEach(function(k) {
                    avatars.push(k["userId"]);
                    if (k["comment"] === null || typeof k["comment"] === "undefined") {
                        k["comment"] = "";
                    }
                    var dateDisplay = moment(k["date"]).format('MMMM Do YYYY, h:mm a');
                    $('#catalogCommentsContainer').append('<div class="row"><div style="" class="col-6 col-sm-3 col-lg-2"><img style="width:100%;display: block;max-width: 100px;margin: 0 auto;" data-userid="'+k.userId+'" /><a style="color:#212529;" href="/users/'+k.userId+'/profile"><h6 class="text-left" data-userid="'+k.userId+'"></h6></a><p class="text-left" style="font-size: small;">'+dateDisplay+'</p></div><div class="col-6 col-sm-9 col-lg-10"><p>'+k["comment"].escapeAllowFormattingBasic()+'</p></div></div><div class="row"><div class="col-sm-12"><hr /></div></div>');
                });
                setUserThumbs(avatars);
                setUserNames(avatars);
                if (d.length >= 25) {
                    window.commentsOffset = window.commentsOffset + 25;
                }else{
                    window.commentsOffset = 0;
                }
            }
            window.commentsLoading = false;
        })
        .catch(function(e) {
            console.log(e);
            $('#catalogCommentsContainer').append('<p style="white-space: pre-wrap; margin-bottom: 0px;">Nobody has commented anything yet.</p>');
        });
}
// Load Recommended
loadRecommended();
function loadRecommended(){
    window.commentsLoading = true;
    request("/catalog/"+catalogid+"/recommended", "GET")
        .then(function(d) {
            if (d.length <= 0 && window.commentsOffset === 0) {
                $('#recommendedCatalogItems').append('<div class="col-12"><p style="white-space: pre-wrap; margin-bottom: 0px;">There are no recommendations based on this item.</p></div>');
            }else{
                var avatars = [];
                d.forEach(function(k) {
                    avatars.push(k["catalogId"]);
                    var collectibleBadge = '<p style="position:absolute;top:0"><i class="gradient-fa fas fa-award"></i></p>';
                    var collectibleUBadge = '<p style="position:absolute;top:0;margin:0.5rem;"><i class="rainbow-fa fas fa-fingerprint"></i></p>';
                    if (k.collectible === 1) {
                        if (k.maxSales !== 0) {
                            // Unique
                            $('#recommendedCatalogItems').append('<div style="" class="col-6 col-md-4 col-lg-2"><img style="width:100%;" data-catalogid="'+k.catalogId+'" /><a style="color:#212529;" href="/catalog/'+k.catalogId+'/"><h6 class="text-center text-truncate">'+k.catalogName.escape()+'</h6></a>'+collectibleUBadge+'</div></div>');
                        }else{
                            // Regular Collectibe
                            $('#recommendedCatalogItems').append('<div style="" class="col-6 col-md-4 col-lg-2"><img style="width:100%;" data-catalogid="'+k.catalogId+'" /><a style="color:#212529;" href="/catalog/'+k.catalogId+'/"><h6 class="text-center text-truncate">'+k.catalogName.escape()+'</h6></a>'+collectibleBadge+'</div></div>');
                        }
                    }else{
                        // Non-Collectible
                        $('#recommendedCatalogItems').append('<div style="" class="col-6 col-md-4 col-lg-2"><img style="width:100%;" data-catalogid="'+k.catalogId+'" /><a style="color:#212529;" href="/catalog/'+k.catalogId+'/"><h6 class="text-center text-truncate">'+k.catalogName.escape()+'</h6></a></div></div>');
                    }
                });
                setCatalogThumbs(avatars);
            }
            window.commentsLoading = false;
        })
        .catch(function(e) {
            console.log(e);
            $('#catalogCommentsContainer').append('<p style="white-space: pre-wrap; margin-bottom: 0px;">Nobody has commented anything yet.</p>');
        });
}

// Load Owners
loadOwners();
function loadOwners(){
    window.ownersLoading = true;
    request("/catalog/"+catalogid+"/owners?sort=asc&limit=25&offset="+window.ownersOffset, "GET")
        .then(function(d) {
            if (d.length <= 0 && window.ownersOffset === 0) {
                $('#catalogItemOwners').append('<div class="col-12"><p style="white-space: pre-wrap; margin-bottom: 0px;">This item does not have any owners.</p></div>');
            }else{
                var avatars = [];
                var serial = "";
                d.forEach(function(k) {
                    if (catalogdata.attr("data-isunique") == 0) {
                        serial = "";
                    }else{
                        if (k.serial !== null) {
                            serial = "# "+k.serial;
                        }else{
                            serial = "# N/A";
                        }
                    }
                    avatars.push(k["userId"]);
                    $('#catalogItemOwners').append('<div style="" class="col-6 col-md-4 col-lg-2"><img style="width:100%;" data-userid="'+k.userId+'" /><a style="color:#212529;" href="/users/'+k.userId+'/profile"><h6 class="text-center text-truncate" data-userid="'+k.userId+'"></h6></a><p class="text-center text-truncate">'+serial+'</p></div></div>');
                });
                setUserThumbs(avatars);
                setUserNames(avatars);
                if (d.length >= 25) {
                    $('#loadMoreOwners').show();
                    window.ownersOffset = window.ownersOffset + 25;
                }else{
                    $('#loadMoreOwners').hide();
                    window.ownersOffset = 0;
                }
            }
            window.ownersLoading = false;
        })
        .catch(function(e) {
            console.log(e);
            if (window.ownersOffset === 0) {
                $('#catalogItemOwners').append('<div class="col-12"><p style="white-space: pre-wrap; margin-bottom: 0px;">This item does not have any owners.</p></div>');
            }else{
                window.ownersOffset = 0;
                $('#loadMoreOwners').hide();
            }
        });
}

$(document).on('click', '#loadMoreOwners', function() {
    loadOwners();
});

$(document).on('click', '#regenThumb', function() {
    request("/catalog/"+catalogid+"/thumbnail/regenerate", "PUT")
        .then(function(d) {
            success("This item's thumbnail will be regenerated.");
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
        });
});

if (catalogdata.attr("data-collectible") === "1" && catalogdata.attr("data-isforsale") === "0") {
    // Get Market Data
    request("/catalog/"+catalogid+"/sellers?offset=0", "GET")
        .then(function(d) {
            d = d.sellers;
            if (d.length <= 0) {
                $('.collectibleNotForSale').show();
            }else{
                $('#collectibleLowestPriceButton').show();
                $('#collectibleLowestPriceParent').show();
                var userIdsRequest = [];
                $.each(d, function(index, value) {
                    var serial = "#N/A";
                        if (value.serial !== null) {
                            serial = "# "+nform(value.serial);
                        }
                    if (value.userId === parseInt(userid)) {
                        if (index === 0) {
                            $('#collectibleLowestPrice').html(formatCurrency(1)+nform(value.price));
                            $('.onClickPurchaseItem').attr("disabled", "disabled");
                            $('.onClickPurchaseItem').html("You're selling this item.")
                            $('.onClickPurchaseItem').attr("data-sellerid", value.userId);
                            $('.onClickPurchaseItem').attr("data-uid", value.userInventoryId);
                        }
                        $('#thirdPartySellersList').append('<div class="row"><div class="col-12"><hr /></div><div style="display:none;" class="col-sm-3 align-self-center" id="catalog_thirdparty_seller_'+index+'"><img style="width:100%;display: block;margin: 0 auto;max-width: 75px;" data-userid="'+value.userId+'" /><a style="color:#212529;" href="/users/'+value.userId+'/profile"><p class="text-center" data-userid='+value.userId+'></p></a></div><div class="align-self-center col-sm-6"><p>'+formatCurrency(1)+nform(value.price)+' </p><p><span style="font-weight:600;">Serial - </span>'+serial+'</p></div><div class="align-self-center col-sm-2" style="margin: 0 auto;"><button data-currency="1" data-price="'+value.price+'" type="button" class="btn btn-small btn-success onClickTakeOffSale" data-sellerid="'+value.userId+'" data-catalogid="'+catalogid+'" data-uid="'+value.userInventoryId+'" style="margin:0 auto;display: block;width:100%;">Take Off Sale</button></div></div>');
                        userIdsRequest.push(value.userId);
                    }else{
                        if (index === 0) {
                            $('#collectibleLowestPrice').html(formatCurrency(1)+nform(value.price));
                            $('.onClickPurchaseItem').attr("data-sellerid", value.userId);
                            $('.onClickPurchaseItem').attr("data-uid", value.userInventoryId);
                            $('.onClickPurchaseItem').attr("data-currency", 1);
                            $('.onClickPurchaseItem').attr("data-price", value.price);
                        }
                        $('#thirdPartySellersList').append('<div class="row"><div class="col-12"><hr /></div><div style="display:none;" class="col-sm-3 align-self-center" id="catalog_thirdparty_seller_'+index+'"><img style="width:100%;display: block;margin: 0 auto;max-width: 75px;" data-userid="'+value.userId+'" /><a style="color:#212529;" href="/users/'+value.userId+'/profile"><p class="text-center" data-userid='+value.userId+'></p></a></div><div class="align-self-center col-sm-6"><p>'+formatCurrency(1)+nform(value.price)+' </p><p><span style="font-weight:600;">Serial - </span>'+serial+'</p></div><div class="align-self-center col-sm-2" style="margin: 0 auto;"><button data-currency="1" data-price="'+value.price+'" type="button" class="btn btn-small btn-success onClickPurchaseItem" data-sellerid="'+value.userId+'" data-catalogid="'+catalogid+'" data-uid="'+value.userInventoryId+'" style="margin:0 auto;display: block;width:100%;">Buy</button></div></div>');
                        userIdsRequest.push(value.userId);
                    }
                });
                setUserThumbs(userIdsRequest);
                setUserNames(userIdsRequest);
            }
        })
        .catch(function(e) {
            // No Sellers
            $('.collectibleNotForSale').show();
        });

        request("/catalog/"+catalogid+"/charts", "GET")
        .then(function(d) {
            if (d.length > 0) {
                /*
                var chartArray = [];
                d.forEach(function(k,v) {
                    chartArray.push({
                        ["x"]: new Date(k["date"]),
                        ["y"]: k["amount"],
                    });
                });

                chartArray.push({
                    x: new Date(),
                    y: undefined,
                });
                */
                let priceArr = [];
                let dateArr = [];
                d.forEach(el => {
                    priceArr.push(el.amount);
                    dateArr.push(new Date(el.date).toISOString());
                });
                let chartTextColor = '#212529';
                let themeForCharts = 'light';
                if (getTheme() === 1) {
                    chartTextColor = '#FFFFFF';
                    themeForCharts = 'dark';
                }
                // makeChart(chartArray);
                let options = {
                    series: [{
                        name: 'Sales Price',
                        data: priceArr,
                    }],
                    chart: {
                        height: 350,
                        type: 'area',
                        foreColor: chartTextColor,
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'smooth'
                    },
                    xaxis: {
                        type: 'datetime',
                        categories: dateArr,
                        foreColor: chartTextColor,
                    },
                    colors: ['#7BD39A'],
                    tooltip: {
                        theme: themeForCharts,
                        x: {
                            format: 'dd/MM/yy HH:mm',
                        },
                    },
                };

                let chart = new ApexCharts(document.querySelector("#chartContainer"), options);
                chart.render();

            }else{
                $('#chartContainer').css("height","auto").append("<p style='margin-bottom:0;'>This item has not sold in the past 365 days.</p>");
            }
        })
        .catch(function(e) {
            console.log(e);
        });
}else{

}
$(document).on('click', '#onClickSellitem', function() {
    var html = {};
    var askForSerial = false;
    itemsUserOwns.forEach(function(l) {
        if (l.serial !== null) {
            askForSerial = true;
        }
        if (!l.serial) {
            l.serial = "N/A";
        }
        html[l.userInventoryId] = l.serial;
    });
    if( itemsUserOwns.length <= 1) {
        askForSerial = false;
    }
    if (askForSerial) {
        question('What serial would you like to sell?', function(d) {
            if (!d) {
                return;
            }
            sell(parseInt(d));
        }, 'select', html);
    }else{
        var uid = parseInt($('#onClickSellitem').attr("uid"));
        sell(uid);
    }
    function sell(userInventoryId) {
        question("What would you like to sell this item for?", function(d) {
            if (isNaN(d)) {
                warning("Please enter a valid price.");
            }else{
                request("/user/market/"+userInventoryId+"/", "PATCH", JSON.stringify({price:parseInt(d)}))
                    .then(function(d) {
                        success("This item was succesfully put on sale.", function() {
                            window.location.reload();
                        })
                    })
                    .catch(function(e) {
                        warning(e.responseJSON.message);
                        console.log(e);
                    })
            }
        });
    }
})
$(document).on('click', '.onClickTakeOffSale', function() {
    var uid = parseInt($(this).attr("data-uid"));
    var catalogid = $(this).attr("data-catalogid");
    var sellerId = parseInt($(this).attr("data-sellerid"));
    request("/user/market/"+uid+"/", "PATCH", JSON.stringify({price:0}))
        .then(function(d) {
            success("This item was succesfully taken off sale.", function() {
                window.location.reload();
            })
        })
        .catch(function(e) {
            warning(e.responseJSON.message);
            console.log(e);
        })
});
$(document).on('click', '.onClickPurchaseItem', function() {
    var uid = parseInt($(this).attr("data-uid"));
    var catalogid = $(this).attr("data-catalogid");
    var sellerId = parseInt($(this).attr("data-sellerid"));
    var currency = parseInt($(this).attr("data-currency"));
    var price = parseInt($(this).attr("data-price"));
    if (userData.attr("data-authenticated") === "true") {
        questionYesNoHtml("Are you sure you'd like to purchase this item for "+formatCurrency(currency)+" "+nform(price)+"?", function(d) {
            request("/economy/"+catalogid+"/buy", "POST", {
                userInventoryId: uid,
                expectedSellerId: sellerId,
                expectedCurrency: currency, 
                expectedPrice: price
            }).then(function(d) {
                    success("This item was succesfully purchased.", function() {
                        window.location.reload();
                    })
                })
                .catch(function(e) {
                    warning(e.responseJSON.message);
                    console.log(e);
                }); 
        });
    }else{
        window.location.href = "/login?return=/catalog/"+catalogid;
    }
})

function makeChart(data) {
	var chart = new CanvasJS.Chart("chartContainer", {
		title:{
		},
		data: [              
		{
            markerBorderColor: "#28a745",
            markerColor: "#28a745",
            dataSeries: "#28a745",
            color: "green",
			// Change type to "doughnut", "line", "splineArea", etc.
			type: "line",
			dataPoints: data,
		}
        ],
        axisY:{
            prefix: "P $",
        } 
	});
	chart.render();
}

$(document).on('click', '#onClickDeleteItem', function(e) {
    questionYesNoHtml('<p>Are you sure you would like to <span style="font-weight:700;">permanently delete</span> this item from your inventory?</p> <p style="margin-top:1rem;font-size:0.75rem;text-align:center;">You will not be refunded for your purchase.</p>', () => {
        loading();
        request('/catalog/'+catalogid+'/inventory','DELETE', {}).then(d => {
            success('This item has been deleted from your inventory.', () => {
                window.location.reload();
            })
        })
        .catch(e => {
            warning(e.responseJSON.message);
        })
    });
    $('button.swal2-confirm').attr('disabled','disabled');
    setTimeout(() => {
        $('button.swal2-confirm').removeAttr('disabled');
    }, 1000);
});