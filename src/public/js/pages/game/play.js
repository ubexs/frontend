// extension to uhh show when divs are visible

// default = featured
let currentSortMode = 1;
// default = any
let currentGenre = 1;
let currentOffset = 0;
let currentLimit = 25;

let metaInfo = $("#meta-play-info");
let possibleGenres = JSON.parse(metaInfo.attr('data-genres'));

// stuff to manage xhr requests
let isLoading = false;
let gamesLoaded = 0;
let areMoreAvailable = false;

request("/game/metadata", 'GET').then(d => {
    if (d.canCreateGames) {
        $('#create-game').show();
    }
}).catch(e => {
    console.log('probably logged out',e);
})
/**
 * get url vars from page url
 */
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
let _selectedGenreQueryParam = getUrlVars()['genre'];
if (_selectedGenreQueryParam) {
    currentGenre = parseInt(_selectedGenreQueryParam);
}

/**
 * when user scrolls to bottom of page, and xhr requests arent loading, and more games can be loaded: load more games
 */
$(window).scroll(function() {
    if (isLoading || !areMoreAvailable) {
        return;
    }
    if($(window).scrollTop() + $(window).height() > $(document).height() - $('div#footerUpper').innerHeight()) {
        currentOffset += 25;
        loadGames();
    }
});

/**
 * when user clicks search filter on mobile, reveal it
 */
$(document).on('click', '#open-search-filters-mobile', function(e) {
    e.preventDefault();
    let dToOpen = $('#search-filters');
    console.log(dToOpen.css('display'));
    if (dToOpen.css('display') === 'block') {
        dToOpen.css('display', 'none');
    }else{
        dToOpen.attr('style','display: block!important;');
    }
});

/**
 * load games via XHR request and append to #topTwoGames
 * @param {boolean} addTopTwoGamesToHeader Wheather or not the top two games list will be visible
 */
function loadGames(addTopTwoGamesToHeader = false) {
    history.replaceState({genre: currentGenre, sort: currentSortMode}, "Free 3D Games", "?genre="+currentGenre+'&sortBy='+currentSortMode+'&offset='+currentOffset)
    isLoading = true;
    request('/game/search?genre='+currentGenre+'&sortBy='+currentSortMode+'&limit='+currentLimit+'&offset='+currentOffset).then((gameData) => {

        let totalResults = gameData.total;
        let d = gameData.data;
        gamesLoaded += d.length;
        if (gamesLoaded >= totalResults) {
            areMoreAvailable = false;
        }else{
            areMoreAvailable = true;
        }
        if (currentGenre === 1) {
            $('title').html('Free 3D Games - ubexs')
        }else{
            $('title').html('Free 3D '+possibleGenres[currentGenre]+' Games - ubexs');
        }
        if (currentGenre === 1) {
            $('#free-games-description').html(`Experience thousands of user-created 3D games designed for all ages, all for free! No download required. Our games are supported on all major devices, including Desktop Computers, Laptop Computers, Tablets, and Phones.`);
        }else{
            $('#free-games-description').html(`Experience thousands of user-created 3D ${possibleGenres[currentGenre]} games designed for all ages, all for free! No download required. Our games are supported on all major devices, including Desktop Computers, Laptop Computers, Tablets, and Phones.`);
        }
        $('#topTwoGames').empty()
        const ids = [];
        const topList = $('#topTwoGames');

        if (addTopTwoGamesToHeader) {
            $('#header-when-top-two-games-are-visible').show();
        }

        if (d.length === 0 && currentOffset === 0) {
            $('#popularGamesList').append(`
            
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <p><span class="font-weight-bold">Uh-oh!</span> It looks like your search didn't return any results.</p>
                    </div>
                </div>
            </div>
            
            `);
            return;
        }

        let index = 0;
        let gameIds = [];
        for (const game of d) {
            gameIds.push(game.gameId);
            if (addTopTwoGamesToHeader && index === 0 || addTopTwoGamesToHeader && index === 1) {
                topList.append(`
                    
                <div class="col-12 col-md-6">
                    <div class="card">
                        <a href="/game/${game.gameId}" class="hidehover">
                            <img data-gameid="${game.gameId}" class="card-img-top" alt="Game Thumbnail">
                            <div class="card-body">
                                <h5 class="card-title">${xss(game.gameName)}</h5>
                                <p class="card-text" style="margin-top:0.5rem;font-size:0.85rem;">

                                Created By: <span data-userid="${game.creatorId}"></span>
                                <br>
                                <span class="font-weight-bold">${game.playerCount}</span> Playing
                                
                                </p>
                                <a href="/game/${game.gameId}" class="btn btn-success" style="margin-top:1rem;width:100%;"><i class="fas fa-play"></i></a>
                            </div>
                        </a>
                    </div>
                </div>
                    
                `
                    /*`
                <div class="col-12 col-md-6">
                <div class="card">
                    <a href="/game/${game.gameId}" class="hidehover">
                        <div class="card-body" style="cursor:pointer;">
                            <div class="row">
                                <div class="col-12">
                                    <h1 style="overflow: hidden;
                                    white-space: nowrap;
                                    text-overflow: ellipsis;
                                    font-size:1.15rem;
                                    padding-bottom:1rem;">${filterXSS(game.gameName)}</h1>
                                </div>
                                <div class="col-6 col-md-8">
                                    ${img}
                                </div>
                                <div class="col-6 col-md-4">
                                    <img src="" data-userid="${game.creatorId}" style="width:100%;" />
                                    Created By <span data-userid="${game.creatorId}"></span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12" style="padding-top:1rem;">
                                    <p>${game.playerCount} Playing</p>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>`
            */);
            }else{
                let img = `<img class="card-img-top" data-gameid="${game.gameId}" style="width:100%;object-fit: fill;display:block;margin: 0 auto;height: 150px;" />`
                $('#popularGamesList').append(`
                <div class="col-6 col-md-4 col-lg-3 on-hover-show-game-info-tooltip" style="padding: 0 0.25rem  0.25rem 0.25rem;">
                    <div class="card">
                        <a href="/game/${game.gameId}" class="normal">
                            ${img}
                            <div class="card-body" style="cursor:pointer;">
                                <div class="row">
                                    <div class="col-12">
                                        <h1 style="overflow: hidden;
                                        font-size:0.85rem;
                                        margin-bottom:0;
                                        line-height:1rem;
                                        height: 2rem;
                                        ">${filterXSS(game.gameName)}</h1>
                                    </div>

                                </div>
                                <div class="row" style="padding-top:0.5rem;">
                                    <div class="col-12">
                                        <p style="font-size:0.75rem;"><span class="font-weight-bold">${number_format(game.playerCount)}</span> People Playing</p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="game-info-tooltip">
                        <div class="card" style="width:100%;padding:0;">
                            <div class="card-body" style="width:100%;padding:0 1rem 1rem 1rem;">
                                <div style="padding-left:0.25rem;">
                                    <p style="line-height:1;font-size:0.65rem;">
                                        <span class="font-weight-bold">Creator</span>: <a href="/users/${game.creatorId}/profile"><span data-userid="${game.creatorId}"></span></a>
                                    </p>
                                    <p style="line-height:1;font-size:0.65rem;margin-top:0.25rem;">
                                        <span class="font-weight-bold">Last Updated</span>: ${moment(game.updatedAt).fromNow()}</a>
                                    </p>
                                </div>
                                <a href="/game/${game.gameId}" class="btn btn-success" style="margin-top:1rem;width:100%;"><i class="fas fa-play"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
                
                `);
            }
            if (game.creatorType === 0) {
                ids.push(game.creatorId);
            }
            index++;
        }
        setUserNames(ids);
        setUserThumbs(ids);
        setGameThumbs(gameIds);
    }).catch((e) => {
        console.error(e);
        warning(e.responseJSON.message);
    })
    .finally(() => {
        isLoading = false;
    });
}
if (currentGenre === 1) {
    gamesLoaded=0;
    areMoreAvailable=false;
    loadGames(true);
}else{
    $('.genreoption').find('li').css('opacity','0.5');
    $('.genreoption').find('li').css('font-weight','400');
    $('.genreoption[data-id='+currentGenre+']').find('li').css('opacity',1).css('font-weight',600);
    gamesLoaded=0;
    areMoreAvailable=false;
    loadGames();
}

$(document).on('click', '.sortoption', function(e) {
    e.preventDefault();
    if (isLoading) {
        return;
    }
    $('#popularGamesList').empty();
    $('#header-when-top-two-games-are-visible').hide();
    $('#topTwoGames').empty().append(`
    <div class="spinner-border" role="status" style="display:block;margin:1rem auto 0 auto;">
        <span class="sr-only">Loading...</span>
    </div>
    `);
    let modeInt = parseInt($(this).attr('data-id'));
    let modeName = xss($(this).attr('data-title'));

    $('.sortoption').find('li').css('opacity','0.5');
    $('.sortoption').find('li').css('font-weight','400');
    $(this).find('li').css('opacity',1);
    $(this).find('li').css('font-weight',600);

    currentSortMode = modeInt;
    $('#title').html(modeName);
    gamesLoaded=0;
    areMoreAvailable=false;
    loadGames();
});
$(document).on('click', '.genreoption', function(e) {
    e.preventDefault();
    if (isLoading) {
        return;
    }
    $('#popularGamesList').empty();
    $('#header-when-top-two-games-are-visible').hide();
    $('#topTwoGames').empty().append(`
    <div class="spinner-border" role="status" style="display:block;margin:1rem auto 0 auto;">
        <span class="sr-only">Loading...</span>
    </div>
    `);
    let modeInt = parseInt($(this).attr('data-id'));

    $('.genreoption').find('li').css('opacity','0.5');
    $('.genreoption').find('li').css('font-weight','400');
    $(this).find('li').css('opacity',1);
    $(this).find('li').css('font-weight',600);

    currentGenre = modeInt;
    gamesLoaded=0;
    areMoreAvailable=false;
    loadGames();
});

