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
exports.UsersController = void 0;
const base_1 = require("../base");
const common_1 = require("@tsed/common");
const model = require("../../models/index");
const swagger_1 = require("@tsed/swagger");
let UsersController = class UsersController extends base_1.default {
    search() {
        return new model.WWWTemplate({
            title: 'Users',
        });
    }
    async profile(userId) {
        userId = base_1.default.ValidateId(userId);
        let userData = await this.Users.getInfo(userId);
        let ViewData = new model.WWWTemplate({ title: userData.username + `'s Profile` });
        let usernameChanges = await this.Users.getPastUsernames(userId);
        let filteredBlurb = '';
        if (typeof userData.blurb === 'string') {
            const primarySpan = '<span style="color:#28a745;margin-right: -3px;"><img alt="$" style="height: 1rem;" src="https://cdn.blockshub.net/static/money-green-2.svg"/> </span>';
            const secondarySpan = '<span style="color:#ffc107;margin-right: -3px;"><img alt="$" style="height: 1rem;" src="https://cdn.blockshub.net/static/coin-stack-yellow.svg"/> </span>';
            const xssfilter = new this.xss.FilterXSS({
                whiteList: {}
            });
            filteredBlurb = xssfilter.process(userData.blurb);
        }
        const forumData = await this.Forums.multiGetUserForumInfo([
            userData.userId,
        ]);
        ViewData.page = {
            userId: userData.userId,
            username: userData.username,
            blurb: filteredBlurb,
            forumPostCount: forumData[0].postCount,
            status: userData.status,
            tradingEnabled: userData.tradingEnabled,
            staff: userData.staff,
            usernameChanges,
            deleted: userData.banned !== 0,
            joinDate: this.moment(userData.joinDate),
            lastOnline: this.moment(userData.lastOnline),
            online: this.moment(userData.lastOnline).isSameOrAfter(this.moment().subtract(3, 'minutes')),
        };
        return ViewData;
    }
    async inventory(userId) {
        userId = base_1.default.ValidateId(userId);
        let userData = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: userData.username + "'s Inventory",
            page: userData,
        });
    }
    async friends(userId) {
        userId = base_1.default.ValidateId(userId);
        let userData = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: userData.username + "'s Friends",
            page: userData,
        });
    }
    async groups(userId) {
        userId = base_1.default.ValidateId(userId);
        let userData = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: userData.username + "'s Groups",
            page: userData,
        });
    }
    async games(userId) {
        userId = base_1.default.ValidateId(userId);
        let userData = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: userData.username + "'s Games",
            page: userData,
        });
    }
    async trade(userId) {
        userId = base_1.default.ValidateId(userId);
        let userData = await this.Users.getInfo(userId);
        if (userData.tradingEnabled !== 1) {
            throw new this.Conflict('UserCannotBeTradedWith');
        }
        return new model.WWWTemplate({
            title: 'Trade with ' + userData.username,
            page: userData,
        });
    }
};
__decorate([
    common_1.Get('/'),
    common_1.Render('users/index'),
    swagger_1.Summary('Users search page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "search", null);
__decorate([
    common_1.Get('/:userId/profile'),
    swagger_1.Summary("Get the {userId}'s profile, or 404 if N/A"),
    common_1.Render('users/profile'),
    __param(0, common_1.Required()),
    __param(0, common_1.PathParams('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "profile", null);
__decorate([
    common_1.Get('/:userId/inventory'),
    swagger_1.Summary("Get the inventory page for the {userId}, or 404 if N/A"),
    common_1.Render('users/inventory'),
    __param(0, common_1.PathParams('userId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "inventory", null);
__decorate([
    common_1.Get('/:userId/friends'),
    swagger_1.Summary("Get the friends page for the {userId}, or 404 if N/A"),
    common_1.Render('users/friends'),
    __param(0, common_1.PathParams('userId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "friends", null);
__decorate([
    common_1.Get('/:userId/groups'),
    swagger_1.Summary("Get the groups page for the {userId}, or 404 if N/A"),
    common_1.Render('users/groups'),
    __param(0, common_1.PathParams('userId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "groups", null);
__decorate([
    common_1.Get('/:userId/games'),
    swagger_1.Summary("Get the games page for the {userId}, or 404 if N/A"),
    common_1.Render('users/games'),
    __param(0, common_1.PathParams('userId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "games", null);
__decorate([
    common_1.Get('/:userId/trade'),
    swagger_1.Summary("Get the trade page for the {userId}, 404 if invalid userId/terminated, or 409 if cannot trade"),
    common_1.Render('users/trade'),
    __param(0, common_1.PathParams('userId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "trade", null);
UsersController = __decorate([
    common_1.Controller('/users')
], UsersController);
exports.UsersController = UsersController;
