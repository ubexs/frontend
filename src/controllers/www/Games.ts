import { Controller, Get, Locals, PathParams, QueryParams, Redirect, Render, Required, Res, Use } from "@tsed/common";
import { Summary } from "@tsed/swagger"; // import swagger Ts.ED module
import * as model from '../../models/index';
import base from '../base'
// Models

import * as middleware from '../../middleware/v1';
const YesAuth = middleware.auth.YesAuth;
import _ = require('lodash');
import config from "../../helpers/config";

@Controller("/game")
export class WWWGameController extends base {
    constructor() {
        super();
    }

    @Get('/:gameId/edit')
    public redirectEditPage(
        @PathParams('gameId', Number) gameId: number,
        @Res() res: Res,
    ) {
        // todo: confirm with game team that this URL is valid
        res.redirect(config.baseUrl.play + '/' + gameId + '/edit');
    }

    @Render('game/create')
    @Get('/create')
    @Use(YesAuth)
    public async gameCreate() {
        let ViewData = new model.WWWTemplate({ title: 'Create a Game' });
        ViewData.page = {};
        return ViewData;
    }

    @Get('/:gameId/play')
    @Summary('Redirect to new play page')
    public redirectToNewPlay(
        @Res() res: Res,
        @PathParams('gameId', Number) gameId: number,
    ) {
        // todo: confirm with game team that this URL is valid
        res.redirect(config.baseUrl.play + '/' + gameId + '/play');
    }

    @Get('/play')
    @Render('game/play')
    public play(
        @QueryParams('genre', Number) genre: number,
    ) {
        if (!model.Games.GameGenres[genre]) {
            genre = 1;
        }
        let title = 'Free 3D Games';
        if (genre !== 1) {
            title = 'Free 3D ' + model.Games.GameGenres[genre] + ' Games';
        }
        return new model.WWWTemplate({
            title: title,
            page: {
                genres: model.Games.GameGenres,
                sorts: model.Games.GameSortOptions,
                genre: genre,
            }
        });
    }

    @Render('game/view')
    @Get('/:gameId')
    public async gamePage(
        @PathParams('gameId', Number) gameId: number,
    ) {
        let gameInfo: model.Games.GameInfo;
        let gameThumb: model.Games.GameThumbnail;
        try {
            gameInfo = await this.Games.getInfo(gameId);
            gameThumb = await this.Games.getGameThumbnail(gameId);
        } catch (e) {
            // Invalid ID
            throw new this.BadRequest('InvalidGameId');
        }
        let ViewData = new model.WWWTemplate<any>({ 'title': gameInfo.gameName });
        ViewData.page = {};
        ViewData.page.gameInfo = gameInfo;
        if (gameInfo.creatorType === 0) {
            // By User
            try {
                const creatorName = await this.Users.getInfo(gameInfo.creatorId);
                ViewData.page.creatorName = creatorName.username;
            } catch (err) {
                ViewData.page.creatorName = '[Deleted' + gameInfo.creatorId + ']';
            }
            ViewData.page.thumbnailId = gameInfo.creatorId;
        } else {
            // By Group
            const creatorName = await this.Groups.getInfo(gameInfo.creatorId);
            ViewData.page.creatorName = creatorName.groupName;
            ViewData.page.thumbnailId = creatorName.groupIconCatalogId;
        }
        ViewData.page.ThumbnailURL = gameThumb.url;
        ViewData.title = gameInfo.gameName;
        ViewData.page.gameGenreString = model.Games.GameGenres[gameInfo.genre];
        ViewData.page.genres = model.Games.GameGenres;
        ViewData.page.GameGenreDescriptions = model.Games.GameGenreDescriptions;
        ViewData.page.GameGenreThumbnails = model.Games.GameGenreThumbnails;
        let possibleGenres: number[] = [];
        for (const genre in model.Games.GameGenres) {
            let numberVal = parseInt(genre, 10);
            if (Number.isInteger(numberVal)) {
                possibleGenres.push(numberVal);
            }
        }
        ViewData.page.recommendedGenres = _.sampleSize(possibleGenres, 4);
        return ViewData;
    }

    @Get('/genre/:gameGenre')
    @Summary('Get the gamePage of a gameGenre')
    public gameGenre(
        @PathParams('gameGenre', String) gameGenre: string,
        @Res() res: Res,
    ) {
        let val = parseInt(gameGenre, 10);
        if (!isNaN(val)) {
            return res.redirect('/game/play');
        }
        let genreToRedirectTo = model.Games.GameGenres[gameGenre as any];
        if (genreToRedirectTo) {
            return res.redirect('/game/play?genre=' + genreToRedirectTo + '&sortBy=1');
        } else {
            return res.redirect('/game/play');
        }
    }

    @Get('/game-check/browser-compatibility')
    @Summary('Confirm browser respects iframe sandbox attribute')
    public browserCompatibilityCheck(
        @Res() res: Res,
    ) {
        res.set('x-frame-options', 'sameorigin');
        res.send(`<!DOCTYPE html><html><head><title>Checking your browser...</title></head><body><script nonce="${res.locals.nonce}">try{alert("Sorry, your browser is not supported.");window.top.location.href = "/support/browser-not-compatible";}catch(e){}</script></body></html>`);
        return;
    }

}