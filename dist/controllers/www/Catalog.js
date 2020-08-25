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
let CatalogController = class CatalogController extends base_1.default {
    Index() {
        return new model.WWWTemplate({
            title: 'Catalog',
        });
    }
    async catalogItemCreate(userInfo) {
        return new model.WWWTemplate({
            title: 'Create an Item',
            page: {
                loadStaffPage: userInfo.staff >= 1,
            }
        });
    }
    async catalogItemEdit(userInfo, catalogId) {
        catalogId = base_1.default.ValidateId(catalogId);
        let ViewData = new model.WWWTemplate({ 'title': '' });
        let catalogData;
        let salesCount = 0;
        try {
            catalogData = await this.Catalog.getInfo(catalogId);
            let _salesData = await this.Catalog.countSales(catalogId);
            salesCount = _salesData.sales;
        }
        catch (e) {
            throw new this.BadRequest('InvalidCatalogId');
        }
        if (userInfo.staff >= 2) {
        }
        else if (catalogData.creatorType === model.Catalog.creatorType.Group) {
            const groupRole = await this.Groups.getUserRole(catalogData.creatorId, userInfo.userId);
            if (groupRole.permissions.manage === 0) {
                throw new this.BadRequest('InvalidPermissions');
            }
        }
        else if (catalogData.creatorType === model.Catalog.creatorType.User) {
            if (catalogData.creatorId !== userInfo.userId) {
                throw new this.BadRequest('InvalidPermissions');
            }
        }
        ViewData.page = {};
        ViewData.page.loadStaffPage = userInfo.staff >= 2;
        ViewData.page.catalogId = catalogData.catalogId;
        ViewData.page.catalogEncodedName = model.urlEncode(catalogData.catalogName);
        ViewData.page.catalogName = catalogData.catalogName;
        ViewData.page.description = catalogData.description;
        ViewData.page.collectible = catalogData.collectible;
        ViewData.page.category = catalogData.category;
        ViewData.page.forSale = catalogData.forSale;
        ViewData.page.userId = catalogData.creatorId;
        ViewData.page.category = catalogData.category;
        ViewData.page.dateCreated = catalogData.dateCreated;
        ViewData.page.maxSales = catalogData.maxSales;
        ViewData.page.price = catalogData.price;
        ViewData.page.currency = catalogData.currency;
        ViewData.page.sales = salesCount;
        ViewData.page.status = catalogData.status;
        ViewData.title = catalogData.catalogName;
        ViewData.page.categories = model.Catalog.category;
        return ViewData;
    }
    async redirectToCatalogItem(res, catalogId) {
        catalogId = base_1.default.ValidateId(catalogId);
        let catalogData = await this.Catalog.getInfo(catalogId);
        const encodedName = model.urlEncode(catalogData.catalogName);
        return res.redirect("/catalog/" + catalogId + "/" + encodedName);
    }
    async catalogItem(catalogId, req) {
        catalogId = base_1.default.ValidateId(catalogId);
        let catalogData = await this.Catalog.getInfo(catalogId);
        let _salesData = await this.Catalog.countSales(catalogId);
        let salesCount = _salesData.sales;
        let ViewData = new model.WWWTemplate({ 'title': '' });
        ViewData.page = {};
        ViewData.page.catalogId = catalogData.catalogId;
        ViewData.page.catalogEncodedName = model.urlEncode(catalogData.catalogName);
        ViewData.page.catalogName = catalogData.catalogName;
        ViewData.page.description = catalogData.description;
        ViewData.page.collectible = catalogData.collectible;
        ViewData.page.forSale = catalogData.forSale;
        ViewData.page.creatorType = catalogData.creatorType;
        ViewData.page.creatorId = catalogData.creatorId;
        ViewData.page.userId = catalogData.userId;
        ViewData.page.category = catalogData.category;
        ViewData.page.dateCreated = catalogData.dateCreated;
        ViewData.page.maxSales = catalogData.maxSales;
        if (catalogData.maxSales > 0) {
            ViewData.page.unique = 1;
        }
        else {
            ViewData.page.unique = 0;
        }
        ViewData.page.price = catalogData.price;
        ViewData.page.currency = catalogData.currency;
        ViewData.page.sales = salesCount;
        ViewData.page.averagePrice = catalogData.averagePrice;
        ViewData.title = catalogData.catalogName;
        return ViewData;
    }
};
__decorate([
    common_1.Get('/'),
    common_1.Render('catalog/index'),
    swagger_1.Summary('Catalog page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "Index", null);
__decorate([
    common_1.Get('/create'),
    swagger_1.Summary('Create a catalog item'),
    common_1.Render('catalog_create'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Locals('userInfo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "catalogItemCreate", null);
__decorate([
    common_1.Get('/:catalogId/:catalogName/edit'),
    common_1.Use(middleware.auth.YesAuth),
    common_1.Render('catalog/edit'),
    __param(0, common_1.Locals('userInfo')),
    __param(1, common_1.PathParams('catalogId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession, Number]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "catalogItemEdit", null);
__decorate([
    common_1.Get('/:catalogId'),
    swagger_1.Summary('Redirect /:id/ to /:id/:name'),
    __param(0, common_1.Res()),
    __param(1, common_1.PathParams('catalogId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "redirectToCatalogItem", null);
__decorate([
    common_1.Get('/:catalogId/:catalogName'),
    swagger_1.Summary('Catalog item page'),
    common_1.Render('catalog/item'),
    __param(0, common_1.PathParams('catalogId')),
    __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "catalogItem", null);
CatalogController = __decorate([
    common_1.Controller('/catalog')
], CatalogController);
exports.CatalogController = CatalogController;
//# sourceMappingURL=Catalog.js.map