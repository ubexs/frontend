/**
 * out of all the js files, this one and the trade one are probably the ugliest code-wise. god i hate front end
 */
var profileData = $('#profiledata');
var userid = profileData.attr("data-userid");
window.catalogOffset = {};

window.category = 10;
window.offset = 0;
window.sort = 1;
window.orderBy = "id";
window.orderByType = "desc";
var url = new URL(window.location.href);
if (url.searchParams.get("category")) {
    window.category = parseInt(url.searchParams.get("category"), 10) || 10;
}
if (url.searchParams.get("orderBy")) {
    window.orderBy = url.searchParams.get("orderBy");
}
if (url.searchParams.get("orderByType")) {
    window.orderByType = url.searchParams.get("orderByType");
}
if (url.searchParams.get("q")) {
    window.q = url.searchParams.get("q");
}

$('#newSortOrder').on('change', function () {
    var val = parseInt($(this).val());
    window.sort = val;
    if (val == 1) {
        window.orderBy = "id";
        window.orderByType = "desc";
    } else if (val == 2) {
        window.orderBy = "price";
        window.orderByType = "asc";
    } else if (val == 3) {
        window.orderBy = "price";
        window.orderByType = "desc";
    }
    reload();
});
$('#featured').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("Featured");
    $('#currentCategoryDescription').html("These are items created by the staff team. It can also feature community-submitted items.");
    window.category = 10;
    reload();
});
$('#all').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("All");
    $('#currentCategoryDescription').html("These are all of our items in the Catalog, both created by users and the staff team.");
    window.category = 11;
    reload();
});
$('#all_hats').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("Hats");
    $('#currentCategoryDescription').html("These are Hats you can wear. They are created by the staff team, as well as by other users through community submissions.");
    window.category = 1;
    reload();
});
$('#all_shirts').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("Shirts");
    $('#currentCategoryDescription').html("These are Shirts you can wear, created by the community.");
    window.category = 2;
    reload();
});
$('#all_pants').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("Pants");
    $('#currentCategoryDescription').html("These are Pants you can wear, created by the community.");
    window.category = 3;
    reload();
});
$('#all_faces').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("Faces");
    $('#currentCategoryDescription').html("These are Faces you can wear, created by the community.");
    window.category = 4;
    reload();
});
$('#all_gears').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("Gears");
    $('#currentCategoryDescription').html("These are Gears you can wear, created by the staff team.");
    window.category = 5;
    reload();
});
$('#all_shoes').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("Shoes");
    $('#currentCategoryDescription').html("These are Shoes you can wear, created by the staff team.");
    window.category = 6;
    reload();
});
$('#all_tshirts').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("TShirts");
    $('#currentCategoryDescription').html("These are TShirts you can wear, created by the community.");
    window.category = 7;
    reload();
});
$('#collectibles').click(function (e) {
    e.preventDefault();
    $('#currentCategoryText').html("Collectibles");
    $('#currentCategoryDescription').html("These are collectible items that can no longer be purchased directly, but can instead be purchased from other users and/or traded.");
    window.category = 20;
    reload();
});
function reload(dontUndoOffset) {
    if (dontUndoOffset !== true) {
        window.offset = 0;
    }
    loadCatalog(window.category, window.offset, dontUndoOffset, window.orderBy, window.orderByType)
}
reload();

$(document).on('click', '#searchForCatalogClick', function () {
    var q = urlencode($('#searchForCatalogInput').val());
    q = q.replace(/-/g, ' ');
    var offset = 0;
    $('#catalogItemsDiv').each(function () {
        $(this).css("opacity", "0.5");
    });
    window.defaultcategory = category;
    request("/catalog?limit=25&offset=" + offset + "&category=" + category + "&orderBy=" + window.orderBy + "&orderByType=" + window.orderByType + "&q=" + q)
        .then(function (d) {
            window.history.replaceState(null, null, "/catalog?category=" + category + "&orderBy=" + orderBy + "&orderByType=" + orderByType + "&q=" + q);
            loadCatalogStuff(d, false);
        })
        .catch(function (e) {
            $('#catalogItemsDiv').empty();
            if (offset === 0) {
                $('#catalogItemsDiv').html('<div class="col sm-12" style="margin-top:1rem;"><h5 class="text-center">Your query returned 0 results.</h5></div>');
                $('#catalogItemsDiv').each(function () {
                    $(this).css("opacity", "1");
                });
            }
        });
});
let loadMoreItemsPossible = false;
$(document).on('click', '.loadMoreItems', function () {
    window.offset = window.offset + 25;
    reload(true);
});

$(window).scroll(function () {
    if (!loadMoreItemsPossible) {
        return;
    }
    if($(window).scrollTop() + $(window).height() > $(document).height() - $('div#footerUpper').innerHeight()) {
        loadMoreItemsPossible = false;
        window.offset = window.offset + 25;
        reload(true);
    }
});

$(document).on('click', '.openInventoryPage', function () {
    $('#userInventoryDiv').empty();
    loadInventory(parseInt($(this).attr("data-id")), 0);
    window.catalogOffset[parseInt($(this).attr("data-id"))] = 0;
});

function loadCatalog(category, offset, dontUndoOffset, orderBy, orderByType) {
    if (typeof offset === "undefined") {
        offset = 0;
    }
    if (dontUndoOffset !== true) {
        $('#catalogItemsDiv').each(function (el) {
            $(this).css("opacity", "0.5");
        });
    }
    window.defaultcategory = category;
    var q = "";
    if (window.q) {
        q = window.q;
        var url = "/catalog?offset=" + offset + "&category=" + category + "&orderBy=" + orderBy + "&orderByType=" + orderByType + "&q=" + window.q;
        delete window.q;
    } else {
        var url = "/catalog?offset=" + offset + "&category=" + category + "&orderBy=" + orderBy + "&orderByType=" + orderByType;
    }
    request(url)
        .then(function (d) {
            window.history.replaceState(null, null, "/catalog?category=" + category + "&orderBy=" + orderBy + "&orderByType=" + orderByType + "&q=" + q);
            loadCatalogStuff(d, dontUndoOffset);
        })
        .catch(function (e) {
            $('#catalogItemsDiv').empty();
            if (offset === 0) {
                $('#catalogItemsDiv').html('<div class="col sm-12" style="margin-top:1rem;"><h5 class="text-center">Your query returned 0 results.</h5></div>');
                $('#catalogItemsDiv').each(function (el) {
                    $(this).css("opacity", "1");
                });
            }
        });
}

function loadCatalogStuff(d, dontUndoOffset) {
    if (dontUndoOffset !== true) {
        $('#catalogItemsDiv').empty();
    }
    $('#catalogItemsDiv').each(function (el) {
        $(this).css("opacity", "1");
    });
    if (d.length <= 0) {
        if (offset === 0) {
            $('#catalogItemsDiv').html('<div class="col sm-12" style="margin-top:1rem;"><h5 class="text-center">Your query returned 0 results.</h5></div>');
        }
    } else {
        var catalogIdsRequest = [];
        let creatorIds = [];
        let groupIds = [];
        $.each(d, function (index, value) {
            value.currency = formatCurrency(value.currency, '0.75rem');
            value.col = "";
            if (value.collectible === 1) {
                if (value.maxSales !== 0) {
                    value.col = `
                    <div style="width:100%;position:absolute;top:0;margin:0.5rem;">
                        <p>
                            <i class="rainbow-fa fas fa-fingerprint" data-toggle="tooltip" data-placement="top" title="This item is a serialied collectible. Each copy has it's own unique serial. You can trade & sell it."></i>
                        </p>
                    </div>`;
                } else {
                    value.col = `
                    <div style="width:100%;position:absolute;top:0;margin:0.5rem;">
                        <p>
                            <i class="gradient-fa fas fa-award" data-toggle="tooltip" data-placement="top" title="This item is collectible. You can trade & sell it."></i>
                        </p>
                    </div>`;
                }
            }
            let byNameTag = `<p class="text-left text-truncate" style="font-weight: 300;font-size: 0.85rem;padding-bottom:0;">By: <span data-userid="${value.creatorId}"></span></p>`;
            if (value.creatorType === 1) {
                byNameTag = `<p class="text-left text-truncate" style="font-weight: 300;font-size: 0.85rem;padding-bottom:0;">By: <span data-groupid="${value.creatorId}"></span></p>`;
                groupIds.push(value.creatorId);
            } else {
                creatorIds.push(value.creatorId);
            }
            let priceDisplay = '';
            if (window.defaultcategory === 20) {
                priceDisplay = `<span style="text-decoration: line-through;opacity:0.5;font-size:0.75rem;">Original: ${formatCurrency(value.currency, '0.75rem')} ${value.price}</span><br>`;
            }
            if (typeof value.price === 'number' && typeof value.collectibleLowestPrice === 'undefined') {
                priceDisplay += value.currency + nform(value.price);
            }else if (value.collectibleLowestPrice) {
                priceDisplay += '<span style="font-size:0.65rem;">Lowest Price: '+formatCurrency(1, '0.75rem') + nform(value.collectibleLowestPrice)+'</span>';
            }else{
                if (window.defaultcategory === 20) {
                    priceDisplay += '<span style="font-size:0.75rem;">No Resellers</span>';
                }else{
                    priceDisplay += '<span style="font-size:0.75rem;">Not for sale</span>';
                }
            }
            $('#catalogItemsDiv').append('<div style="padding-right: 5px;padding-left: 5px;" class="col-6 col-sm-4 col-md-3 catalogItem" data-catalogid="' + value.catalogId + '"><div class="card" style="margin: 0.5rem 0 0 0;border: 0;box-shadow:none;"><a href="/catalog/' + value.catalogId + '/' + urlencode(value.catalogName) + '"><img data-catalogid="' + value.catalogId + '" style="width:100%;" class="image-with-background" /></a>' + value.col + ' <div class="card-body" style="padding: 0.75rem;"><div class="card-title text-left text-truncate" style="margin-bottom:0;font-size:0.85rem;"><a href="/catalog/' + value.catalogId + '/' + urlencode(value.catalogName) + '">' + xss(value.catalogName) + '</a>' + byNameTag + '<p class="text-left text-truncate">'+priceDisplay+'</p></div></div></div></div>');
            catalogIdsRequest.push(value.catalogId);
        });
        $('[data-toggle="tooltip"]').tooltip();
        setCatalogThumbs(catalogIdsRequest);
        setUserNames(creatorIds);
        setGroupNames(groupIds);
    }
    if (d.length >= 25) {
        loadMoreItemsPossible = true;
        $('#loadingMoreItems').show();
    } else {
        loadMoreItemsPossible = false;
        $('#loadingMoreItems').hide();
    }
}