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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradesController = void 0;
const base_1 = require("../base");
const common_1 = require("@tsed/common");
const model = require("../../models/index");
const middleware = require("../../middleware/v1");
const swagger_1 = require("@tsed/swagger");
let TradesController = class TradesController extends base_1.default {
    async trades() {
        let info = await this.TradeAds.metadata();
        return new model.WWWTemplate({
            title: 'Trades',
            page: {
                tradeAdsMetadata: info,
            }
        });
    }
    async tradeAds() {
        let info = await this.TradeAds.metadata();
        if (!info.isEnabled) {
            throw new this.Conflict('NotEnabled');
        }
        return new model.WWWTemplate({
            title: 'Trade Ads',
        });
    }
    async trade() {
        let info = await this.TradeAds.metadata();
        if (!info.isEnabled) {
            throw new this.Conflict('NotEnabled');
        }
        return new model.WWWTemplate({
            title: 'Create a Trade Ad',
            page: {
                mode: 'CreateTradeAd',
            },
        });
    }
};
__decorate([
    common_1.Get('/'),
    common_1.Get('/default'),
    swagger_1.Summary('User trades page/overview'),
    common_1.Render('trades/default'),
    common_1.Use(middleware.auth.YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradesController.prototype, "trades", null);
__decorate([
    common_1.Get('/ads'),
    common_1.Get('/ads/default'),
    swagger_1.Summary('Trade ads dashboard'),
    common_1.Render('trades/ads'),
    common_1.Use(middleware.auth.YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradesController.prototype, "tradeAds", null);
__decorate([
    common_1.Get('/create'),
    swagger_1.Summary("Create a trade ad"),
    common_1.Render('users/trade'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradesController.prototype, "trade", null);
TradesController = __decorate([
    common_1.Controller('/trades')
], TradesController);
exports.TradesController = TradesController;
