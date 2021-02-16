var profileData = $('#userdata');
var userid = profileData.attr("data-userid");
window.invOffset = {};
setUserThumbs([parseInt(userid)]);
window.wearingItems = [];
var outfitTabOpen = false;
// setup polling
const pollForChanges = () => {
    request("/avatar/poll", "GET")
        .then((d) => {
            if ($('#userAvatarImage').attr('src') !== d.url) {
                $('#userAvatarImage').attr('src', d.url);
                $('#userAvatarImage').css('opacity', '1');
            }
            
            // OK
            pollForChanges();
        })
        .catch((e) => {
            pollForChanges();
        })
}
pollForChanges();

window.LegRGB = [255, 255, 255];
window.HeadRGB = [255, 255, 255];
window.TorsoRGB = [255, 255, 255];

window.TShirt = false;
request("/user/" + userid + "/avatar", "GET")
    .then(function (d) {
        d["avatar"].forEach(function (v) {
            if (v["type"] === 4) {
                window.Face = v["catalogId"];
            } else if (v["type"] === 7) {
                window.TShirt = v["catalogId"];
            } else if (v["type"] === 2) {
                window.Shirt = v["catalogId"];
            } else if (v["type"] === 3) {
                window.Pants = v["catalogId"];
            } else {
                window.wearingItems.push(v["catalogId"]);
            }
        });
        var col = d.color[0];
        loadInventory(1);
        window.LegRGB = [
            col.legr,
            col.legg,
            col.legb,
        ];
        window.TorsoRGB = [
            col.torsor,
            col.torsog,
            col.torsob,
        ];
        window.HeadRGB = [
            col.headr,
            col.headg,
            col.headb,
        ];
    })
    .catch(function (e) {
        loadInventory(1);
    });

var colors = [
    { "value": [255, 255, 255], "name": "White" },
    { "value": [52, 58, 64], "name": "Dark", "hex": "#343a40" },
    { "value": [255, 34, 34], "name": "Red", "hex": "#ff3c3c" },
    { "value": [40, 167, 69], "name": "Green" },
    { "value": [255, 175, 0], "name": "Light Orange", "hex": "#E9C600" },
    { "value": [255, 193, 7], "name": "Yellow" },
    { "value": [207, 179, 68], "name": "Noob Yellow", "hex": "#D5C881" },
    { "value": [179, 215, 255], "name": "Pastel Light Blue", "hex": "#C8D9E9" },
    { "value": [0, 125, 255], "name": "Blue" },
    { "value": [111, 66, 193], "name": "Purple" },
    { "value": [188, 155, 93], "name": "Burlap", "hex": "#BBAF96" },
    { "value": [86, 66, 54], "name": "Brown", "hex": "#907F74" },
    { "value": [204, 142, 105], "name": "Pastel Brown", "hex": "#D4B49D" },
];

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

$(document).on('click', '.openAvatarColoring', function () {
    outfitTabOpen = false;
    $('#userInventoryDiv').empty();
    $('button.loadMoreItems').hide();
    window.loadedItems = {};
    var type = $(this).attr("data-type");
    var color = "";
    colors.forEach(function (val) {
        if (typeof val["hex"] !== "undefined") {
            color = val["hex"];
        } else {
            color = val["name"];
        }
        $('#userInventoryDiv').append('<div class="col-6 col-sm-6 col-md-3 userInventoryColor" data-type="' + type + '" data-colorvalue="' + xss(val["name"]) + '" ><div class="card" style="margin: 1rem 0;"><div style="width:100%;height: 8rem;background-color:' + color + '"></div> <div class="card-body" style="padding:5px;"><div class="card-title text-left text-truncate" style="margin-bottom:0;font-size:0.75rem;">' + xss(val["name"]) + '</div></div></div></div>');
    });
    $('#userInventoryDiv').append('<div class="col-6 col-sm-6 col-md-3 userInventoryColor" data-type="' + type + '" data-colorvalue="custom" ><div class="card" style="margin: 1rem 0;padding:0.5rem;"><input type="text" class="form-control" id="customHEX" placeholder="HEX" style="font-size:0.75rem;"> <div class="card-body" style="padding:5px;"><div class="card-title text-left text-truncate" style="margin-bottom:0;"><button type="button" id="submitCustomColor" class="btn btn-primary" style="width:100%;font-size:0.75rem;margin-top:1rem;margin-bottom;1rem;" data-type="' + type + '">Custom HEX</button></div></div></div></div>');
});
$(document).on('click', '#submitCustomColor', function () {
    var type = $(this).attr("data-type");
    var hex = $('#customHEX').val();
    hex = hexToRgb(hex);
    var r = parseInt(hex["r"]);
    var g = parseInt(hex["g"]);
    var b = parseInt(hex["b"]);
    if (r !== null && g !== null && b !== null && r <= 255 && g <= 255 && b <= 255) {
        window[type] = [r, g, b];
        $('#userInventoryDiv').empty();
        toast(true, "Your " + type + " coloring has been updated.");
        loadInventory(1);
    } else {
        warning("Please make sure you have entered a proper value for R,G, and B, then try again.")
    }
})
$(document).on('click', '.userInventoryColor', function () {
    var type = $(this).attr("data-type");
    colors.forEach((val) => {
        if (val["name"] === $(this).attr("data-colorvalue")) {
            window[type] = JSON.parse(JSON.stringify(val["value"]));
            $('#userInventoryDiv').empty();
            toast(true, "Your " + type + " coloring has been updated.");
            loadInventory(1);
        } else {

        }
    })
});
$(document).on('click', '.loadMoreItems', function () {
    loadInventory(window.defaultcategory, window.invOffset[window.defaultcategory]);
});
$(document).on('click', '.openInventoryPage', function () {
    outfitTabOpen = false;
    window.loadedItems = {};
    $('#userInventoryDiv').empty();
    loadInventory(parseInt($(this).attr("data-id")), 0);
    window.invOffset[parseInt($(this).attr("data-id"))] = 0;
});

$(document).on('click', '#buttonUpdateAvatar', function () {
    try {
        localStorage.setItem('LegRGB', window.LegRGB);
        localStorage.setItem('TorsoRGB', window.TorsoRGB);
        localStorage.setItem('HeadRGB', window.HeadRGB);
    } catch (e) {
        console.log(e);
        // Doesn't support localstorage
    }
    request("/avatar", "PATCH", JSON.stringify({ "LegRGB": window.LegRGB, "HeadRGB": window.HeadRGB, "TorsoRGB": window.TorsoRGB, "Hats": window.wearingItems, "Face": window.Face, "TShirt": window.TShirt, "Shirt": window.Shirt, "Pants": window.Pants }))
        .then(function (d) {
            success("Your avatar has been updated! Please wait a few seconds for your avatar to update on the website.");
            $('#userAvatarImage').css('opacity', '0.5');
        })
        .catch(function (e) {
            warning(e.responseJSON.message);
        });
});

const loadOutfits = () => {
    outfitTabOpen = true;
    $('#userInventoryDiv').empty();
    $('.loadMoreItems').hide();
    request('/avatar/outfits?limit=100', 'GET').then(d => {
        if (d.total === 0) {
            $('#userInventoryDiv').append(`<div class="col-12"><h2 style="margin-top:1rem;text-align:center;">You don't have any outfits.</h2></div>`);
            return;
        }
        for (const outfit of d.outfits) {
            $('#userInventoryDiv').append(`
            
            <div class="col-6 col-sm-12 col-md-6 col-xl-3" style="margin-top:1rem;">
                <div class="card">
                    <img src="${outfit.url}" class="card-img-top" />
                    <div class="card-body" style="padding-top:0;">
                        <p class="text-truncate" style="font-size:0.75rem;">${xss(outfit.name)}</p>
                        <button type="button" class="btn btn-success wearOutfit" data-id="${outfit.outfitId}" style="font-size:0.75rem;width:100%;margin-top:1rem;">Wear</button>
                        <div class="dropdown">
                            <button type="button" data-toggle="dropdown" class="btn btn-secondary dropdown-toggle" style="font-size:0.75rem;width:100%;margin-top:0.5rem;">Edit</button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item editOutfit" href="#" data-id="${outfit.outfitId}" data-currentname="${xss(outfit.name)}">Name</a>
                                <a class="dropdown-item deleteOutfit" data-id="${outfit.outfitId}" href="#">Delete</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            `);
        }
    })
        .catch(e => {
            console.error(e);
        })
}


$(document).on('click', '#buttonCreateOutfit', function () {
    loading();
    request("/avatar/outfit/create", "POST", JSON.stringify({ "LegRGB": window.LegRGB, "HeadRGB": window.HeadRGB, "TorsoRGB": window.TorsoRGB, "Hats": window.wearingItems, "Face": window.Face, "TShirt": window.TShirt, "Shirt": window.Shirt, "Pants": window.Pants }))
        .then(function (d) {
            success("Your outfit has been created. Check it out in the \"Outfits\" tab.");
            if (outfitTabOpen) {
                loadOutfits();
            }
        })
        .catch(function (e) {
            warning(e.responseJSON.message);
        });
});

$(document).on('click', '.editOutfit', function (e) {
    e.preventDefault();
    let id = parseInt($(this).attr('data-id'), 10);
    let oldName = xss($(this).attr('data-name'));

    question("Please enter a new name for this outfit.", function (d) {
        if (d.length >= 64 || d.length < 1) {
            return warning('Please specify a valid name.');
        }
        loading();
        request('/avatar/outfit/' + id + '/name', 'PATCH', {
            name: d,
        }).then(d => {
            toast(true, 'Outfit name updated');
            loadOutfits();
        })
            .catch(e => {
                toast(false, 'Outfit name could not be updated. Try again.');
            })
    });
});
$(document).on('click', '.deleteOutfit', function (e) {
    e.preventDefault();
    let id = parseInt($(this).attr('data-id'), 10);
    loading();
    request('/avatar/outfit/' + id + '/', 'DELETE', {}).then(d => {
        toast(true, 'Outfit deleted.');
        loadOutfits();
    })
        .catch(e => {
            toast(false, 'Outfit could not be deleted. Try again.');
        })
});
$(document).on('click', '.wearOutfit', function (e) {
    e.preventDefault();
    let id = parseInt($(this).attr('data-id'), 10);
    loading();
    request('/avatar/outfit/'+id+'/', 'GET').then(avatarDetails => {
        console.log(avatarDetails);
        let avatarItems = avatarDetails.avatar;
        let colors = avatarDetails.colors[0];
        window.LegRGB = [
            colors.legr,
            colors.legg,
            colors.legb,
        ];
        window.HeadRGB = [
            colors.headr,
            colors.headg,
            colors.headb,
        ];
        window.TorsoRGB = [
            colors.torsor,
            colors.torsog,
            colors.torsob,
        ];
        window.wearingItems = [];
        window.Shirt = false;
        window.Pants = false;
        window.Face = false;
        window.TShirt = false;
        for (const item of avatarItems) {
            if (item.type === 2) {
                window.Shirt = item.catalogId;
            }else if (item.type === 3) {
                window.Pants = item.catalogId;
            }else if (item.type === 4) {
                window.Face = item.catalogId;
            }else if (item.type === 7) {
                window.TShirt = item.catalogId;
            }else{
                window.wearingItems.push(item.catalogId);
            }
        }
        request("/avatar", "PATCH", JSON.stringify({ "LegRGB": window.LegRGB, "HeadRGB": window.HeadRGB, "TorsoRGB": window.TorsoRGB, "Hats": window.wearingItems, "Face": window.Face, "TShirt": window.TShirt, "Shirt": window.Shirt, "Pants": window.Pants }))
        .then(function (d) {
            success("Your avatar has been updated! Please wait a few seconds for your avatar to update on the website.");
            $('#userAvatarImage').css('opacity', '0.5');
        })
        .catch(function (e) {
            warning(e.responseJSON.message);
        });
    })
    .catch(e => {
        console.error(e);
        warning(e.responseJSON.message);
    })
});

$(document).on('click', '.openOutfitsPage', function () {
    loadOutfits();
});

$(document).on('click', '.userInventoryItem', function () {
    let isSelected = $(this).find(".card").attr('data-selected') === 'true';
    let select = (el) => {
        if (!el) {
            el = $(this);
        }
        el.find(".card").attr('data-selected', 'true');
    }
    let unSelect = (el) => {
        if (!el) {
            el = $(this);
        }
        el.find(".card").attr('data-selected', 'false');
    }
    if (isSelected) {
        unSelect();
        $(this).find(".card").css("border", "1px solid rgba(0, 0, 0, 0.125)");
        if (parseInt($(this).attr("data-category")) === 4) {
            window.Face = false;
        } else if (parseInt($(this).attr("data-category")) === 7) {
            window.TShirt = false;
        } else if (parseInt($(this).attr("data-category")) === 2) {
            window.Shirt = false;
        } else if (parseInt($(this).attr("data-category")) === 3) {
            window.Pants = false;
        } else {
            var index = window.wearingItems.indexOf(parseInt($(this).attr("data-catalogid")));
            if (index > -1) {
                window.wearingItems.splice(index, 1);
            }
        }
    } else {
        //window.wearingItems.push(parseInt($(this).attr("data-catalogid")));
        switch (parseInt($(this).attr('data-category'))) {
            case 4: {
                window.Face = parseInt($(this).attr("data-catalogid"));
                $('#userInventoryDiv').children(".userInventoryItem").each(function () {
                    $(this).find(".card").css("border", "1px solid rgba(0, 0, 0, 0.125)");
                    unSelect($(this));
                });
                break;
            }
            case 7: {
                window.TShirt = parseInt($(this).attr("data-catalogid"));
                $('#userInventoryDiv').children(".userInventoryItem").each(function () {
                    $(this).find(".card").css("border", "1px solid rgba(0, 0, 0, 0.125)");
                    unSelect($(this));
                });
                break;
            }
            case 2: {
                window.Shirt = parseInt($(this).attr("data-catalogid"));
                $('#userInventoryDiv').children(".userInventoryItem").each(function () {
                    $(this).find(".card").css("border", "1px solid rgba(0, 0, 0, 0.125)");
                    unSelect($(this));
                });
                break;
            }
            case 3: {
                window.Pants = parseInt($(this).attr("data-catalogid"));
                $('#userInventoryDiv').children(".userInventoryItem").each(function () {
                    $(this).find(".card").css("border", "1px solid rgba(0, 0, 0, 0.125)");
                    unSelect($(this));
                });
                break;
            }
            case 5: {
                $('#userInventoryDiv').children(".userInventoryItem").each(function () {
                    $(this).find(".card").css("border", "1px solid rgba(0, 0, 0, 0.125)");
                    unSelect($(this));
                    var index = window.wearingItems.indexOf(parseInt($(this).attr("data-catalogid")));
                    if (index > -1) {
                        window.wearingItems.splice(index, 1);
                    }
                });
                window.wearingItems.push(parseInt($(this).attr("data-catalogid")));
                break;
            }
            default: {
                if (window.wearingItems.includes(parseInt($(this).attr("data-catalogid"))) === false) {
                    window.wearingItems.push(parseInt($(this).attr("data-catalogid")));
                }
            }
        }
        $(this).find(".card").css("border", "2px solid rgb(40, 167, 69)");
        select($(this));
    }
});

function loadInventory(category, offset) {
    if (typeof offset === "undefined") {
        offset = 0;
    }
    window.defaultcategory = category;
    request("/user/" + userid + "/inventory?sort=desc&offset=" + offset + "&category=" + category)
        .then(function (d) {
            d = d.items;
            if (d.length <= 0) {
                if (offset === 0) {
                    $('#userInventoryDiv').html('<div class="col sm-12" style="margin-top:1rem;"><h5 class="text-center">You do not have any items in this category.</h5></div>');
                }
            } else {
                var catalogIdsRequest = [];
                $.each(d, function (index, value) {
                    if (typeof window.loadedItems === "undefined" || typeof window.loadedItems[value.catalogId] === "undefined") {
                        if (window.wearingItems.includes(value.catalogId) || value.catalogId === window.Face || value.catalogId === window.TShirt || value.catalogId === window.Shirt || value.catalogId === window.Pants) {
                            $('#userInventoryDiv').append('<div class="col-6 col-sm-6 col-md-3 userInventoryItem" data-category="' + value.category + '" data-catalogid="' + value.catalogId + '"><div class="card" style="margin: 1rem 0;display:none;border: 2px solid rgb(40, 167, 69);"><img class="onHoverChangeOpacity" data-catalogid="' + value.catalogId + '" style="width:100%;" /> <div class="card-body"><div class="card-title text-left text-truncate" style="margin-bottom:0;"><a href="/catalog/' + value.catalogId + '/">' + xss(value.catalogName) + '</a></div></div></div></div>');
                        } else {
                            $('#userInventoryDiv').append('<div class="col-6 col-sm-6 col-md-3 userInventoryItem" data-category="' + value.category + '" data-catalogid="' + value.catalogId + '"><div class="card" style="margin: 1rem 0;display:none;"><img class="onHoverChangeOpacity" data-catalogid="' + value.catalogId + '" style="width:100%;" /> <div class="card-body"><div class="card-title text-left text-truncate" style="margin-bottom:0;"><a href="/catalog/' + value.catalogId + '/">' + xss(value.catalogName) + '</a></div></div></div></div>');
                        }
                        //$('#userInventoryDiv').append('<div style="display:none;" class="col-sm-2" id="user_inventory_item_'+index+'"><img style="width:100%;" /><a style="color:#212529;" href="/catalog/'+value.catalogId+'/"><p class="text-center text-truncate">'+value.catalogName+'</p></a></div>');
                        catalogIdsRequest.push(value.catalogId);
                        if (typeof window.loadedItems === "undefined") {
                            window.loadedItems = {};
                        }
                        window.loadedItems[value.catalogId] = true;
                    } else {

                    }
                });
                setCatalogThumbs(catalogIdsRequest);
            }
            if (d.length >= 25) {
                if (typeof window.invOffset[category] === "undefined") {
                    window.invOffset[category] = 0;
                }
                window.invOffset[category] = window.invOffset[category] + 25;
                $('.loadMoreItems').css("display", "block")
            } else {
                $('.loadMoreItems').hide();
            }
        })
        .catch(function (e) {
            if (offset === 0) {
                $('#userInventoryDiv').html('<div class="col sm-12" style="margin-top:1rem;"><h5 class="text-center">You do not have any items in this category.</h5></div>');
            }
        });
}