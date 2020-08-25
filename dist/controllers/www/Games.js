"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@tsed/common");
const swagger_1 = require("@tsed/swagger");
const model = require("../../models/index");
const base_1 = require("../base");
const middleware = require("../../middleware/v1");
const YesAuth = middleware.auth.YesAuth;
const _ = require("lodash");
const config_1 = require("../../helpers/config");
let WWWGameController = class WWWGameController extends base_1.default {
    constructor() {
        super();
    }
    redirectEditPage(gameId, res) {
        gameId = base_1.default.ValidateId(gameId);
        res.redirect(config_1.default.baseUrl.play + '/' + gameId + '/edit');
    }
    async gameCreate() {
        let ViewData = new model.WWWTemplate({ title: 'Create a Game' });
        ViewData.page = {};
        return ViewData;
    }
    redirectToNewPlay(res, gameId) {
        gameId = base_1.default.ValidateId(gameId);
        res.redirect(config_1.default.baseUrl.play + '/' + gameId + '/play');
    }
    play(genre) {
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
    async gamePage(gameId) {
        gameId = base_1.default.ValidateId(gameId);
        let gameInfo;
        let gameThumb;
        try {
            gameInfo = await this.Games.getInfo(gameId);
            gameThumb = await this.Games.getGameThumbnail(gameId);
        }
        catch (e) {
            throw new this.BadRequest('InvalidGameId');
        }
        let ViewData = new model.WWWTemplate({ 'title': gameInfo.gameName });
        ViewData.page = {};
        ViewData.page.gameInfo = gameInfo;
        if (gameInfo.creatorType === 0) {
            try {
                const creatorName = await this.Users.getInfo(gameInfo.creatorId);
                ViewData.page.creatorName = creatorName.username;
            }
            catch (err) {
                ViewData.page.creatorName = '[Deleted' + gameInfo.creatorId + ']';
            }
            ViewData.page.thumbnailId = gameInfo.creatorId;
        }
        else {
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
        let possibleGenres = [];
        for (const genre in model.Games.GameGenres) {
            let numberVal = parseInt(genre, 10);
            if (Number.isInteger(numberVal)) {
                possibleGenres.push(numberVal);
            }
        }
        ViewData.page.recommendedGenres = _.sampleSize(possibleGenres, 4);
        return ViewData;
    }
    gameGenre(gameGenre, res) {
        let val = parseInt(gameGenre, 10);
        if (!isNaN(val)) {
            return res.redirect('/game/play');
        }
        let genreToRedirectTo = model.Games.GameGenres[gameGenre];
        if (genreToRedirectTo) {
            return res.redirect('/game/play?genre=' + genreToRedirectTo + '&sortBy=1');
        }
        else {
            return res.redirect('/game/play');
        }
    }
    browserCompatibilityCheck(res) {
        res.set('x-frame-options', 'sameorigin');
        res.send(`<!DOCTYPE html><html><head><title>Checking your browser...</title></head><body><script nonce="${res.locals.nonce}">try{alert("Sorry, your browser is not supported.");window.top.location.href = "/support/browser-not-compatible";}catch(e){}</script></body></html>`);
        return;
    }
};
__decorate([
    common_1.Get('/:gameId/edit'),
    __param(0, common_1.PathParams('gameId', Number)),
    __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WWWGameController.prototype, "redirectEditPage", null);
__decorate([
    common_1.Render('game/create'),
    common_1.Get('/create'),
    common_1.Use(YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WWWGameController.prototype, "gameCreate", null);
__decorate([
    common_1.Get('/:gameId/play'),
    swagger_1.Summary('Redirect to new play page'),
    __param(0, common_1.Res()),
    __param(1, common_1.PathParams('gameId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], WWWGameController.prototype, "redirectToNewPlay", null);
__decorate([
    common_1.Get('/play'),
    common_1.Render('game/play'),
    __param(0, common_1.QueryParams('genre', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WWWGameController.prototype, "play", null);
__decorate([
    common_1.Render('game/view'),
    common_1.Get('/:gameId'),
    __param(0, common_1.PathParams('gameId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WWWGameController.prototype, "gamePage", null);
__decorate([
    common_1.Get('/genre/:gameGenre'),
    swagger_1.Summary('Get the gamePage of a gameGenre'),
    __param(0, common_1.PathParams('gameGenre', String)),
    __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WWWGameController.prototype, "gameGenre", null);
__decorate([
    common_1.Get('/game-check/browser-compatibility'),
    swagger_1.Summary('Confirm browser respects iframe sandbox attribute'),
    __param(0, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WWWGameController.prototype, "browserCompatibilityCheck", null);
WWWGameController = __decorate([
    common_1.Controller("/game"),
    __metadata("design:paramtypes", [])
], WWWGameController);
exports.WWWGameController = WWWGameController;
//# sourceMappingURL=Games.js.map