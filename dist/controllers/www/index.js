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
exports.GenericWWWController = void 0;
const base_1 = require("../base");
const common_1 = require("@tsed/common");
const model = require("../../models/index");
const middleware = require("../../middleware/v1");
const swagger_1 = require("@tsed/swagger");
let GenericWWWController = class GenericWWWController extends base_1.default {
    performanceTest() {
        return 'BWS OK';
    }
    async getUserRoleInGroup(userId, groupId) {
        const info = await this.Groups.getUserRole(groupId, userId);
        return info.name;
    }
    redirectToDiscord() { }
    redirectOldPlayPage() { }
    redirectIfNoLongerBanned() { }
    Terms() {
        return new model.WWWTemplate({
            title: "Terms of Service",
        });
    }
    async buyCurrency() {
        let count = 1500;
        try {
            count = await this.Catalog.countAllItemsForSale();
        }
        catch (e) {
        }
        return new model.WWWTemplate({
            title: 'Currency',
            page: {
                catalogCount: count,
            }
        });
    }
    Index(res, info) {
        if (info) {
            return res.redirect('/dashboard');
        }
        return new model.WWWTemplate({
            title: 'Free 3D Browser Games',
        });
    }
    dashboard() {
        return new model.WWWTemplate({
            title: 'Dashboard',
        });
    }
    avatar() {
        return new model.WWWTemplate({
            title: 'Avatar',
        });
    }
    transactions() {
        return new model.WWWTemplate({
            title: 'Transactions',
        });
    }
    settings() {
        return new model.WWWTemplate({
            title: 'Settings',
        });
    }
    moderation() {
        return new model.WWWTemplate({
            title: 'Moderation History',
        });
    }
    login() {
        return new model.WWWTemplate({
            title: 'Login',
        });
    }
    async signup(res, req) {
        let referral = undefined;
        if (typeof req.query['r'] === 'string') {
            let referralId = parseInt(req.query['r'], 10);
            console.log('ref is', referralId, typeof referralId);
            if (referralId && Number.isInteger(referralId)) {
                referral = await this.UserReferral.getInfoById(referralId);
                let referer = req.headers['referer'];
                if (referer) {
                    const badReferers = [
                        'brick-hill.com',
                        'finobe.com',
                    ];
                    for (const bad of badReferers) {
                        if (referer.indexOf(bad) !== -1) {
                            res.redirect('https://www.google.com');
                            return;
                        }
                    }
                }
            }
        }
        return new model.WWWTemplate({
            title: "Signup",
            page: {
                referral,
            }
        });
    }
    emailVerification(code) {
        return new model.WWWTemplate({ 'title': 'Email Verification', page: { 'code': code } });
    }
    resetPasswordRequest() {
        return new model.WWWTemplate({
            title: 'Reset Your Password',
            page: {},
        });
    }
    async resetPassword(code, userId) {
        return new model.WWWTemplate({
            title: 'Reset Password',
            page: {
                code,
                userId,
            }
        });
    }
    loadNotifications() {
        return new model.WWWTemplate({
            title: 'Notifications',
        });
    }
    V1AuthenticationFlow(returnUrl) {
        let parsedUrl = returnUrl.replace(/https:\/\//g, '');
        parsedUrl = parsedUrl.replace(/http:\/\//g, '');
        let positionOfFirstSlash = parsedUrl.indexOf('/');
        if (positionOfFirstSlash !== -1) {
            parsedUrl = parsedUrl.slice(0, positionOfFirstSlash);
        }
        return new model.WWWTemplate({
            title: "Sign Into " + parsedUrl,
            page: {
                url: returnUrl,
                parsedUrl: parsedUrl,
            }
        });
    }
    async whitelistIpUrl(code) {
        return new model.WWWTemplate({
            title: 'Ip Whitelist',
            page: {
                code,
            }
        });
    }
};
__decorate([
    common_1.Get('/perf.txt'),
    swagger_1.Summary('Perf'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "performanceTest", null);
__decorate([
    common_1.Get('/api/group/GetUserRoleInGroupAsync'),
    swagger_1.Summary('GetUserRoleInGroupAsync'),
    __param(0, common_1.Required()),
    __param(0, common_1.QueryParams('userId')),
    __param(1, common_1.Required()),
    __param(1, common_1.QueryParams('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], GenericWWWController.prototype, "getUserRoleInGroup", null);
__decorate([
    common_1.Get('/discord'),
    common_1.Redirect(302, 'https://discord.gg/9eXgJue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "redirectToDiscord", null);
__decorate([
    common_1.Get('/play'),
    common_1.Redirect(302, '/game/play'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "redirectOldPlayPage", null);
__decorate([
    common_1.Get('/membership/notapproved.aspx'),
    common_1.Redirect(302, '/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "redirectIfNoLongerBanned", null);
__decorate([
    common_1.Get("/terms"),
    common_1.Render('terms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "Terms", null);
__decorate([
    common_1.Get('/currency'),
    swagger_1.Summary('Currency shop'),
    common_1.Use(middleware.auth.YesAuth),
    common_1.Render('currency'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GenericWWWController.prototype, "buyCurrency", null);
__decorate([
    common_1.Get('/'),
    common_1.Render('index_a'),
    __param(0, common_1.Res()),
    __param(1, common_1.Locals('userInfo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, model.UserSession]),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "Index", null);
__decorate([
    common_1.Get('/dashboard'),
    common_1.Render('dashboard'),
    common_1.Use(middleware.auth.YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "dashboard", null);
__decorate([
    common_1.Get('/avatar'),
    swagger_1.Summary('Customize avatar page'),
    common_1.Render('avatar'),
    common_1.Use(middleware.auth.YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "avatar", null);
__decorate([
    common_1.Get('/transactions'),
    swagger_1.Summary('User transactions page/overview'),
    common_1.Render('transactions'),
    common_1.Use(middleware.auth.YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "transactions", null);
__decorate([
    common_1.Get('/settings'),
    swagger_1.Summary('User account settings'),
    common_1.Render('settings'),
    common_1.Use(middleware.auth.YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "settings", null);
__decorate([
    common_1.Get('/moderation'),
    swagger_1.Summary('User account moderation history/overview'),
    common_1.Render('moderation'),
    common_1.Use(middleware.auth.YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "moderation", null);
__decorate([
    common_1.Get('/login'),
    common_1.Render('login'),
    common_1.Use(middleware.auth.NoAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "login", null);
__decorate([
    common_1.Get('/signup'),
    swagger_1.Summary('Signup page'),
    common_1.Use(middleware.auth.NoAuth),
    common_1.Render('signup'),
    __param(0, common_1.Res()),
    __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GenericWWWController.prototype, "signup", null);
__decorate([
    common_1.Get('/email/verify'),
    swagger_1.Summary('Email verification page'),
    common_1.Use(middleware.auth.YesAuth),
    common_1.Render('email_verify'),
    __param(0, common_1.QueryParams('code', String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "emailVerification", null);
__decorate([
    common_1.Get('/request/password-reset'),
    swagger_1.Summary('Request password reset email'),
    common_1.Render('request_password_reset'),
    common_1.Use(middleware.auth.NoAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "resetPasswordRequest", null);
__decorate([
    common_1.Get('/reset/password'),
    swagger_1.Summary('Reset the users password from an email URL'),
    common_1.Use(middleware.auth.NoAuth),
    common_1.Render('reset_password'),
    __param(0, common_1.Required()),
    __param(0, common_1.QueryParams('code', String)),
    __param(1, common_1.Required()),
    __param(1, common_1.QueryParams('userId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], GenericWWWController.prototype, "resetPassword", null);
__decorate([
    common_1.Get('/notifications'),
    swagger_1.Summary('Notifications page'),
    common_1.Use(middleware.auth.YesAuth),
    common_1.Render('notifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "loadNotifications", null);
__decorate([
    common_1.Get('/v1/authenticate-to-service'),
    swagger_1.Summary('Authenticate to service'),
    common_1.Use(middleware.auth.YesAuth),
    common_1.Render('authenticate-to-service'),
    __param(0, common_1.QueryParams('returnUrl', String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GenericWWWController.prototype, "V1AuthenticationFlow", null);
__decorate([
    common_1.Get('/ip/whitelist'),
    swagger_1.Summary('Url to whitelist ip'),
    common_1.Render('ip-whitelist'),
    __param(0, common_1.Required()),
    __param(0, common_1.QueryParams('code', String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GenericWWWController.prototype, "whitelistIpUrl", null);
GenericWWWController = __decorate([
    common_1.Controller('/')
], GenericWWWController);
exports.GenericWWWController = GenericWWWController;
