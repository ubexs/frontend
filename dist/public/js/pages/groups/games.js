let offset = 0;
let limit = 100;
let sortBy = 1;
let total = 0;
let isLoading = false;
let areMoreAvailable = true;
let profileId = parseInt($('#profiledata').attr('data-userid'), 10);

const loadGames = () => {
    if (isLoading) {
        return;
    }
    isLoading = true;
    request('/game/search?genre=1&sortBy='+sortBy+'&limit='+limit+'&offset='+offset+'&creatorType=0&creatorId='+profileId)
    .then(d => {
        isLoading = false;
        if (d.data.length === 0 && d.total === 0) {
            $('#UserGamesDiv').empty().append(`<div class="col-12"><p style="margin-top:1rem;text-align:center;font-weight:600;">This user has not created any games.</p></div>`);
            return;
        }
        total = d.total;
        if (total > offset + d.data.length) {
            // show more
            areMoreAvailable = true;
            $('#load-more-games').removeAttr('disabled');
        }else{
            // dont show more
            areMoreAvailable = false;
            $('#load-more-games').attr('disabled','disabled');
        }
        let gameIds = [];
        for (const game of d.data) {
            gameIds.push(game.gameId);
            let img = `<img class="card-img-top" data-gameid="${game.gameId}" style="width:100%;object-fit: fill;display:block;margin: 0 auto;height: 150px;" />`
            $('#UserGamesDiv').append(`
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
        setGameThumbs(gameIds);
    })
    .catch(e => {
        console.error(e);
        isLoading = false;
        warning(e.responseJSON.message);
    })
}
loadGames();

$('#sort-by').change(function(e) {
    e.preventDefault();
    if (isLoading) {
        return;
    }
    sortBy = parseInt($(this).val(), 10);
    offset = 0;
    $('#UserGamesDiv').empty();
    loadGames();
});

$(document).on('click', '#load-more-games', function(e) {
    if (areMoreAvailable && !isLoading) {
        $(this).attr('disabled','disabled');
        offset += limit;
        loadGames();
    }
});