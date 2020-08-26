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
var currencyType;
(function (currencyType) {
    currencyType[currencyType["Primary"] = 1] = "Primary";
    currencyType[currencyType["Secondary"] = 2] = "Secondary";
})(currencyType || (currencyType = {}));
const common_1 = require("@tsed/common");
const swagger_1 = require("@tsed/swagger");
var category;
(function (category) {
    category[category["Hat"] = 1] = "Hat";
    category[category["Shirt"] = 2] = "Shirt";
    category[category["Pants"] = 3] = "Pants";
    category[category["Faces"] = 4] = "Faces";
    category[category["Gear"] = 5] = "Gear";
    category[category["Shoes"] = 6] = "Shoes";
    category[category["TShirt"] = 7] = "TShirt";
    category[category["GroupIcon"] = 8] = "GroupIcon";
    category[category["Head"] = 9] = "Head";
})(category = exports.category || (exports.category = {}));
var assetType;
(function (assetType) {
    assetType[assetType["Texture"] = 0] = "Texture";
    assetType[assetType["OBJ"] = 1] = "OBJ";
    assetType[assetType["MTL"] = 2] = "MTL";
})(assetType = exports.assetType || (exports.assetType = {}));
var collectible;
(function (collectible) {
    collectible[collectible["true"] = 1] = "true";
    collectible[collectible["false"] = 0] = "false";
})(collectible = exports.collectible || (exports.collectible = {}));
var isForSale;
(function (isForSale) {
    isForSale[isForSale["true"] = 1] = "true";
    isForSale[isForSale["false"] = 0] = "false";
})(isForSale = exports.isForSale || (exports.isForSale = {}));
var moderatorStatus;
(function (moderatorStatus) {
    moderatorStatus[moderatorStatus["Ready"] = 0] = "Ready";
    moderatorStatus[moderatorStatus["Pending"] = 1] = "Pending";
    moderatorStatus[moderatorStatus["Moderated"] = 2] = "Moderated";
})(moderatorStatus = exports.moderatorStatus || (exports.moderatorStatus = {}));
var searchCategory;
(function (searchCategory) {
    searchCategory[searchCategory["Featured"] = 10] = "Featured";
    searchCategory[searchCategory["Any"] = 11] = "Any";
    searchCategory[searchCategory["Collectibles"] = 20] = "Collectibles";
})(searchCategory = exports.searchCategory || (exports.searchCategory = {}));
var creatorType;
(function (creatorType) {
    creatorType[creatorType["User"] = 0] = "User";
    creatorType[creatorType["Group"] = 1] = "Group";
})(creatorType = exports.creatorType || (exports.creatorType = {}));
class CatalogCreationSuccessResponse {
}
__decorate([
    common_1.Required(),
    swagger_1.Example(true),
    __metadata("design:type", Boolean)
], CatalogCreationSuccessResponse.prototype, "success", void 0);
__decorate([
    common_1.Required(),
    swagger_1.Description('the id of the catalogItem created'),
    __metadata("design:type", Number)
], CatalogCreationSuccessResponse.prototype, "id", void 0);
exports.CatalogCreationSuccessResponse = CatalogCreationSuccessResponse;
class CatalogItemComment {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], CatalogItemComment.prototype, "userId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], CatalogItemComment.prototype, "date", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], CatalogItemComment.prototype, "comment", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], CatalogItemComment.prototype, "isDeleted", void 0);
exports.CatalogItemComment = CatalogItemComment;
class SearchResults {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], SearchResults.prototype, "catalogId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], SearchResults.prototype, "catalogName", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], SearchResults.prototype, "price", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], SearchResults.prototype, "currency", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], SearchResults.prototype, "userId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], SearchResults.prototype, "collectible", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Object)
], SearchResults.prototype, "maxSales", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Object)
], SearchResults.prototype, "collectibleLowestPrice", void 0);
exports.SearchResults = SearchResults;
class LowestPriceCollectibleItems {
}
exports.LowestPriceCollectibleItems = LowestPriceCollectibleItems;
