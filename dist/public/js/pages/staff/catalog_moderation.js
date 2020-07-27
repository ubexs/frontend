window.catalogThumbsArray = {};
function setCatalogThumbsIgnoreModeration(idsUnInit)
{
    var type = "catalog";
    function setThumb(id, src) {
        $("img[data-" + type + "id='" + id + "']").attr("src", src);
        // TODO: Remove this and possible return a promise or something to tell the calling function when to show it's parent (or parent's parent, or parent's parent's parent, etc [you can see how this doesn't work well])
        $("img[data-" + type + "id='" + id + "']").parent().show();
    }
    // Setup Subsitution URL
    var sub = window.subsitutionimageurl;
    // Only supports catalog and user for now
    if (type !== "user" && type !== "catalog") {
        return false;
    }
    // Setup Globals
    if (window["thumbArray" + type] === undefined) {
        window["thumbArray" + type] = {};
    }
    if (window["pendingThumbArray" + type] === undefined) {
        window["pendingThumbArray" + type] = {};
    }
    // Global to Variable
    var global = window["thumbArray" + type];
    var pending = window["pendingThumbArray" + type];
    // Filter duplicates
    var ids = [...new Set(idsUnInit)];
    // Duplicate Array
    var pendingIds = JSON.parse(JSON.stringify(ids));
    // If larger than 25
    if (pendingIds.length > 25) {
        // Break it up into multiple requests
        setThumbs(type, pendingIds.slice(25));
        pendingIds = pendingIds.slice(0, 25);
    }
    ids.forEach(function (k, v, object) {
        if (typeof global[k] !== "undefined" && global[k] !== null || pending[k] !== undefined) {
            pendingIds.forEach(function (num, index, obj) {
                if (num === k) {
                    pendingIds.splice(index, 1)
                }
            });
        } else {
            pending[k] = true;
        }
        if (global[k] !== undefined) {
            setThumb(k, global[k]);
        }else{
            setThumb(k, window.subsitutionimageurl);
        }
    });
    if (pendingIds.length > 0) {
        pendingIds = arrayToCsv(pendingIds);
        request("/staff/catalog/thumbnails?ids=" + pendingIds, "GET")
            .then(function (pics) {
                $.each(pics, function (index, value) {
                    if (value.userId) {
                        if (value.url) {
                            global[value.userId] = value.url;
                            setThumb(value.userId, value.url);
                        } else {
                            setThumb(value.userId, sub);
                        }
                        $("img[data-" + type + "id='" + value.userId + "']").parent().show();
                    } else if (value.catalogId) {
                        if (value.url) {
                            global[value.catalogId] = value.url;
                            setThumb(value.catalogId, value.url);
                        } else {
                            setThumb(value.catalogId, sub);
                        }
                        $("img[data-" + type + "id='" + value.catalogId + "']").parent().show();
                    }
                });
                // Repair any broken images
                $('img[data-' + type + 'id]').each(function () {
                    if (typeof $(this).attr("src") === "undefined") {
                        $(this).attr("src", sub);
                        $(this).parent().show();
                    }
                });
            })
            .catch(function (e) {
                // Reset
                $('img[data-' + type + 'id]').each(function () {
                    if (typeof $(this).attr("src") === "undefined") {
                        $(this).attr("src", sub);
                        $(this).parent().show();
                    }
                });
            })
    }
}

function setGameThumbsIgnoreModeration(idsUnInit)
{
    var type = "game";
    function setThumb(id, src) {
        $("img[data-" + type + "id='" + id + "']").attr("src", src);
        // TODO: Remove this and possible return a promise or something to tell the calling function when to show it's parent (or parent's parent, or parent's parent's parent, etc [you can see how this doesn't work well])
        $("img[data-" + type + "id='" + id + "']").parent().show();
    }
    // Setup Subsitution URL
    var sub = window.subsitutionimageurl;
    // Only supports catalog and user for now
    if (type !== "user" && type !== "catalog") {
        return false;
    }
    // Setup Globals
    if (window["thumbArray" + type] === undefined) {
        window["thumbArray" + type] = {};
    }
    if (window["pendingThumbArray" + type] === undefined) {
        window["pendingThumbArray" + type] = {};
    }
    // Global to Variable
    var global = window["thumbArray" + type];
    var pending = window["pendingThumbArray" + type];
    // Filter duplicates
    var ids = [...new Set(idsUnInit)];
    // Duplicate Array
    var pendingIds = JSON.parse(JSON.stringify(ids));
    // If larger than 25
    if (pendingIds.length > 25) {
        // Break it up into multiple requests
        setThumbs(type, pendingIds.slice(25));
        pendingIds = pendingIds.slice(0, 25);
    }
    ids.forEach(function (k, v, object) {
        if (typeof global[k] !== "undefined" && global[k] !== null || pending[k] !== undefined) {
            pendingIds.forEach(function (num, index, obj) {
                if (num === k) {
                    pendingIds.splice(index, 1)
                }
            });
        } else {
            pending[k] = true;
        }
        if (global[k] !== undefined) {
            setThumb(k, global[k]);
        }else{
            setThumb(k, window.subsitutionimageurl);
        }
    });
    if (pendingIds.length > 0) {
        pendingIds = arrayToCsv(pendingIds);
        request("/staff/game/thumbnails?ids=" + pendingIds, "GET")
            .then(function (pics) {
                $.each(pics, function (index, value) {
                    if (value.userId) {
                        if (value.url) {
                            global[value.userId] = value.url;
                            setThumb(value.userId, value.url);
                        } else {
                            setThumb(value.userId, sub);
                        }
                        $("img[data-" + type + "id='" + value.userId + "']").parent().show();
                    } else if (value.gameId) {
                        if (value.url) {
                            global[value.gameId] = value.url;
                            setThumb(value.gameId, value.url);
                        } else {
                            setThumb(value.gameId, sub);
                        }
                        $("img[data-" + type + "id='" + value.gameId + "']").parent().show();
                    }
                });
                // Repair any broken images
                $('img[data-' + type + 'id]').each(function () {
                    if (typeof $(this).attr("src") === "undefined") {
                        $(this).attr("src", sub);
                        $(this).parent().show();
                    }
                });
            })
            .catch(function (e) {
                // Reset
                $('img[data-' + type + 'id]').each(function () {
                    if (typeof $(this).attr("src") === "undefined") {
                        $(this).attr("src", sub);
                        $(this).parent().show();
                    }
                });
            })
    }
}
loadItems();
function loadItems() {
    $('#pendingAssetsDiv').empty();
    request("/staff/catalog/pending")
        .then((d) => {
            if(d.length >=1) {
                var catalogIds = [];
                var gameIds = [];
                d.forEach(function(k) {
                    if (k.type ==='CatalogItem') {
                        catalogIds.push(k.catalogId);
                    if (k.catalogName) {
                        k.catalogName = k.catalogName.escape();
                    }
                    $('#pendingAssetsDiv').append(`
                    <div class="col-sm-12 col-md-6 col-lg-4" style="margin-top:1rem;">
                        <div class="card">
                            <div class="card-body">
                                <img data-catalogid="`+k.catalogId+`" style="width:100%;" />
                                <div class="card-title text-center">
                                    <h6 style="margin-bottom:1rem;" class="text-truncate">`+k.catalogName+`</h6>
                                    <button type="button" class="btn btn-success approveCatalogItem" data-id="`+k.catalogId+`" style="width:100%;margin-bottom:1rem;">Approve</button>
                                    <!-- Example split danger button -->
                                    <div class="btn-group dropup" style="width:100%;">
                                        <button type="button" data-id="`+k.catalogId+`" class="btn btn-danger declineCatalogItem">Decline</button>
                                        <button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <span class="sr-only">Toggle Dropdown</span>
                                        </button>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item banUploader" data-length="0" data-catalogname="`+k.catalogName+`" data-userid="`+k.userId+`" data-id="`+k.catalogId+`" href="#">Warn Uploader</a>
                                            <a class="dropdown-item banUploader" data-catalogname="`+k.catalogName+`" data-userid="`+k.userId+`" data-id="`+k.catalogId+`" data-length="1" href="#">1 Day Ban Uploader</a>
                                            <a class="dropdown-item banUploader" data-catalogname="`+k.catalogName+`" data-userid="`+k.userId+`" data-id="`+k.catalogId+`" href="#" data-length="7">7 Day Ban Uploader</a>
                                            <div class="dropdown-divider"></div>
                                            <a class="dropdown-item terminateUploader" data-catalogname="`+k.catalogName+`" data-userid="`+k.userId+`" data-id="`+k.catalogId+`" href="#">Terminate Uploader</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
                }else if (k.type === 'Advertisment') {
                    if (!k.title) {
                        k.title = 'N/A';
                    }
                    $('#pendingAssetsDiv').append(`
                    <div class="col-sm-12 col-md-6 col-lg-4" style="margin-top:1rem;">
                        <div class="card">
                            <div class="card-body">
                                <img style="width:100%;" src="${k.imageUrl}" />
                                <div class="card-title text-center">
                                    <h6 style="margin-bottom:1rem;" class="text-truncate">${k.title.escape()}</h6>
                                    <button type="button" class="btn btn-success approveAdvertisment" data-id="`+k.adId+`" style="width:100%;margin-bottom:1rem;">Approve</button>
                                    <!-- Example split danger button -->
                                    <div class="btn-group dropup" style="width:100%;">
                                        <button type="button" data-id="`+k.adId+`" class="btn btn-danger declineAdvertisment">Decline</button>
                                        <button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <span class="sr-only">Toggle Dropdown</span>
                                        </button>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item banUploaderAd" data-length="0" data-catalogname="`+k.title.escape()+`" data-userid="`+k.userId+`" data-id="`+k.adId+`" href="#">Warn Uploader</a>
                                            <a class="dropdown-item banUploaderAd" data-catalogname="`+k.title.escape()+`" data-userid="`+k.userId+`" data-id="`+k.adId+`" data-length="1" href="#">1 Day Ban Uploader</a>
                                            <a class="dropdown-item banUploaderAd" data-catalogname="`+k.title.escape()+`" data-userid="`+k.userId+`" data-id="`+k.adId+`" href="#" data-length="7">7 Day Ban Uploader</a>
                                            <div class="dropdown-divider"></div>
                                            <a class="dropdown-item terminateUploaderAd" data-catalogname="`+k.title.escape()+`" data-userid="`+k.userId+`" data-id="`+k.adId+`" href="#">Terminate Uploader</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
                }else if (k.type === 'GameThumbnail') {
                    $('#pendingAssetsDiv').append(`
                    <div class="col-sm-12 col-md-6 col-lg-4" style="margin-top:1rem;">
                        <div class="card">
                            <div class="card-body">
                                <img style="width:100%;" src="${k.url}" />
                                <div class="card-title text-center">
                                    <h6 style="margin-bottom:1rem;" class="text-truncate">&emsp;</h6>
                                    <button type="button" class="btn btn-success approveGameThumbnail" data-id="`+k.gameThumbnailId+`" style="width:100%;margin-bottom:1rem;">Approve</button>
                                    <!-- Example split danger button -->
                                    <div class="btn-group dropup" style="width:100%;">
                                        <button type="button" data-id="`+k.gameThumbnailId+`" class="btn btn-danger declineGameThumbnail">Decline</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
                }
                });
                setCatalogThumbsIgnoreModeration(catalogIds);
            }else{
                $('#pendingAssetsDiv').append('<div class="col-12"><h3>There are no pending assets at this time.</h3></div>')
            }
        })
        .catch((e) => {
            console.log(e);
            toast(false, e.responseJSON.message);
        });
    }
$(document).on('click', '.approveCatalogItem', function() {
    request("/staff/catalog/"+parseInt($(this).attr("data-id"))+"/", "PATCH", JSON.stringify({"state":0}))
        .then(function(d) {
            console.log(d);
            toast(true, "The specified item has been approved.");
            loadItems();
        })
        .catch(function(e) {
            toast(false, "The specified item could not be approved. Please try again.");
            loadItems();
        });

});
$(document).on('click', '.approveAdvertisment', function() {
    request("/staff/ad/"+parseInt($(this).attr("data-id"))+"/", "PATCH", JSON.stringify({"state":1}))
        .then(function(d) {
            console.log(d);
            toast(true, "The specified ad item has been approved.");
            loadItems();
        })
        .catch(function(e) {
            toast(false, "The specified ad item could not be approved. Please try again.");
            loadItems();
        });

});
$(document).on('click', '.approveGameThumbnail', function() {
    request("/staff/game-thumbnail/"+parseInt($(this).attr("data-id"))+"/", "PATCH", JSON.stringify({"state":1}))
        .then(function(d) {
            console.log(d);
            toast(true, "The specified ad item has been approved.");
            loadItems();
        })
        .catch(function(e) {
            toast(false, "The specified ad item could not be approved. Please try again.");
            loadItems();
        });
});
$(document).on('click', '.declineGameThumbnail', function() {
    request("/staff/game-thumbnail/"+$(this).attr("data-id")+"/", "PATCH", JSON.stringify({"state":2}))
        .then(function(d) {
            console.log(d);
            toast(true, "The specified item has been declined.");
            loadItems();
        })
        .catch(function(e) {
            toast(false, "The specified item could not be declined. Please try again.");
            loadItems();
        });
});
function decline(catalogid) {
    request("/staff/catalog/"+catalogid+"/", "PATCH", JSON.stringify({"state":2}))
        .then(function(d) {
            console.log(d);
            toast(true, "The specified catalog item has been declined.");
            loadItems();
        })
        .catch(function(e) {
            toast(false, "The specified catalog item could not be declined. Please try again.");
            loadItems();
        });
}
function declineAd(adid) {
    request("/staff/ad/"+adid+"/", "PATCH", JSON.stringify({"state":2}))
        .then(function(d) {
            console.log(d);
            toast(true, "The specified ad item has been declined.");
            loadItems();
        })
        .catch(function(e) {
            toast(false, "The specified ad item could not be declined. Please try again.");
            loadItems();
        });
}
$(document).on('click', '.declineCatalogItem', function() {
    decline(parseInt($(this).attr("data-id")));
});
$(document).on('click', '.declineAdvertisment', function() {
    declineAd(parseInt($(this).attr("data-id")));
});

$(document).on('click', '.banUploader', function() {
    var id = parseInt($(this).attr('data-id'));
    decline(id);
    var userId = parseInt($(this).attr('data-userid'));
    var len = parseInt($(this).attr('data-length'));
    var name = $(this).attr('data-catalogname');
    var reason = "The item you uploaded, \""+name+"\", is not appropriate for our website. Please fully review our terms of service before uploading assets.";
    request("/staff/user/"+userId+"/ban", "POST", JSON.stringify({"reason":reason,"privateReason": 'Automated Ban',"length":len,"lengthType":'days',"terminated":0,"deleted":0}))
        .then(function(d) {
            console.log(d);
        })
        .catch(function(e) {
            console.log(e);
            toast(false, 'This user couldn\'t be banned. Try again.');
        });
});

$(document).on('click', '.banUploaderAd', function() {
    var id = parseInt($(this).attr('data-id'));
    declineAd(id);
    var userId = parseInt($(this).attr('data-userid'));
    var len = parseInt($(this).attr('data-length'));
    var name = $(this).attr('data-title') || 'N/A';
    var reason = "The advertisement you uploaded, \""+name+"\", is not appropriate for our website. Please fully review our terms of service before uploading assets.";
    request("/staff/user/"+userId+"/ban", "POST", JSON.stringify({"reason":reason,"privateReason": 'Automated Ban',"length":len,"lengthType":'days',"terminated":0,"deleted":0}))
        .then(function(d) {
            console.log(d);
        })
        .catch(function(e) {
            console.log(e);
            toast(false, 'This user couldn\'t be banned. Try again.');
        });
});