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
const base_1 = require("../base");
const common_1 = require("@tsed/common");
const model = require("../../models/index");
const middleware = require("../../middleware/v1");
const swagger_1 = require("@tsed/swagger");
let AdsWWWController = class AdsWWWController extends base_1.default {
    ads(res, info) {
        return new model.WWWTemplate({
            title: 'Ads',
        });
    }
    async createCatalogAd(userInfo, catalogId) {
        let info = await this.Catalog.getInfo(catalogId);
        if (info.creatorType === model.Catalog.creatorType.User && info.creatorId !== userInfo.userId) {
            throw new this.BadRequest('InvalidCatalogId');
        }
        else if (info.creatorType === model.Catalog.creatorType.Group) {
            let groupInfo = await this.Groups.getInfo(info.creatorId);
            if (groupInfo.groupOwnerUserId !== userInfo.userId) {
                throw new this.BadRequest('InvalidCatalogId');
            }
        }
        return new model.WWWTemplate({
            title: 'Create Catalog Ad', page: {
                catalogInfo: info,
                adDisplayTypes: model.Ads.AdDisplayType,
            }
        });
    }
    async createGroupAd(userInfo, groupId) {
        let info = await this.Groups.getInfo(groupId);
        if (info.groupStatus === model.Groups.groupStatus.locked || info.groupOwnerUserId !== userInfo.userId) {
            throw new this.BadRequest('InvalidGroupId');
        }
        return new model.WWWTemplate({
            title: 'Create Group Ad', page: {
                groupInfo: info,
                adDisplayTypes: model.Ads.AdDisplayType,
            }
        });
    }
    async createThreadAd(userInfo, threadId) {
        let info = await this.Forums.getThreadById(threadId);
        if (info.userId !== userInfo.userId) {
            throw new this.BadRequest('InvalidThreadId');
        }
        return new model.WWWTemplate({
            title: 'Create Thread Ad', page: {
                threadInfo: info,
                adDisplayTypes: model.Ads.AdDisplayType,
            }
        });
    }
};
__decorate([
    common_1.Get('/'),
    swagger_1.Summary('User ads manage page/overview'),
    common_1.Render('ads/dashboard'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Res()),
    __param(1, common_1.Locals('userInfo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, model.UserSession]),
    __metadata("design:returntype", void 0)
], AdsWWWController.prototype, "ads", null);
__decorate([
    common_1.Get('/catalog/create/:catalogId'),
    common_1.Render('ads/catalog_create'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Locals('userInfo')),
    __param(1, common_1.PathParams('catalogId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession, Number]),
    __metadata("design:returntype", Promise)
], AdsWWWController.prototype, "createCatalogAd", null);
__decorate([
    common_1.Get('/group/create/:groupId'),
    common_1.Render('ads/group_create'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Locals('userInfo')),
    __param(1, common_1.PathParams('groupId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession, Number]),
    __metadata("design:returntype", Promise)
], AdsWWWController.prototype, "createGroupAd", null);
__decorate([
    common_1.Get('/thread/create/:threadId'),
    common_1.Render('ads/thread_create'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Locals('userInfo')),
    __param(1, common_1.PathParams('threadId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession, Number]),
    __metadata("design:returntype", Promise)
], AdsWWWController.prototype, "createThreadAd", null);
AdsWWWController = __decorate([
    common_1.Controller('/ads')
], AdsWWWController);
exports.AdsWWWController = AdsWWWController;
