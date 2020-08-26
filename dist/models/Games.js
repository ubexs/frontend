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
const common_1 = require("@tsed/common");
var GameState;
(function (GameState) {
    GameState[GameState["public"] = 1] = "public";
    GameState[GameState["private"] = 2] = "private";
    GameState[GameState["underReview"] = 3] = "underReview";
})(GameState = exports.GameState || (exports.GameState = {}));
class GameThumbnail {
}
__decorate([
    common_1.Required(),
    common_1.AllowTypes('string', 'null'),
    __metadata("design:type", Object)
], GameThumbnail.prototype, "url", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], GameThumbnail.prototype, "moderationStatus", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], GameThumbnail.prototype, "gameId", void 0);
exports.GameThumbnail = GameThumbnail;
var GameGenres;
(function (GameGenres) {
    GameGenres[GameGenres["Any"] = 1] = "Any";
    GameGenres[GameGenres["Building"] = 2] = "Building";
    GameGenres[GameGenres["Town & City"] = 3] = "Town & City";
    GameGenres[GameGenres["Military"] = 4] = "Military";
    GameGenres[GameGenres["Comedy"] = 5] = "Comedy";
    GameGenres[GameGenres["Medieval"] = 6] = "Medieval";
    GameGenres[GameGenres["Adventure"] = 7] = "Adventure";
    GameGenres[GameGenres["Sci-Fi"] = 8] = "Sci-Fi";
    GameGenres[GameGenres["Naval"] = 9] = "Naval";
    GameGenres[GameGenres["FPS"] = 10] = "FPS";
    GameGenres[GameGenres["RPG"] = 11] = "RPG";
    GameGenres[GameGenres["Sports"] = 12] = "Sports";
    GameGenres[GameGenres["Fighting"] = 13] = "Fighting";
    GameGenres[GameGenres["Western"] = 14] = "Western";
})(GameGenres = exports.GameGenres || (exports.GameGenres = {}));
var GameGenreDescriptions;
(function (GameGenreDescriptions) {
    GameGenreDescriptions[GameGenreDescriptions["Thousands of free 3D games from every genre"] = 1] = "Thousands of free 3D games from every genre";
    GameGenreDescriptions[GameGenreDescriptions["Build stuff with friends"] = 2] = "Build stuff with friends";
    GameGenreDescriptions[GameGenreDescriptions["Begin work at your dream job & have a family in Town & City games"] = 3] = "Begin work at your dream job & have a family in Town & City games";
    GameGenreDescriptions[GameGenreDescriptions["Be a soldier in military games"] = 4] = "Be a soldier in military games";
    GameGenreDescriptions[GameGenreDescriptions["Laugh and meet new people in Comedy games"] = 5] = "Laugh and meet new people in Comedy games";
    GameGenreDescriptions[GameGenreDescriptions["Rule an ancient kingdom in Medieval games"] = 6] = "Rule an ancient kingdom in Medieval games";
    GameGenreDescriptions[GameGenreDescriptions["Explore vast land with friends in Adventure games"] = 7] = "Explore vast land with friends in Adventure games";
    GameGenreDescriptions[GameGenreDescriptions["Discover aliens in Sci-Fi games"] = 8] = "Discover aliens in Sci-Fi games";
    GameGenreDescriptions[GameGenreDescriptions["Seek new lands and battle players in Naval games"] = 9] = "Seek new lands and battle players in Naval games";
    GameGenreDescriptions[GameGenreDescriptions["Form teams and destroy enemies in FPS (First-Person Shooter) games"] = 10] = "Form teams and destroy enemies in FPS (First-Person Shooter) games";
    GameGenreDescriptions[GameGenreDescriptions["Roleplay with the only limit bing your imagination in RPG (Role-Playing) games"] = 11] = "Roleplay with the only limit bing your imagination in RPG (Role-Playing) games";
    GameGenreDescriptions[GameGenreDescriptions["Get active and work closely with your team in Sports games"] = 12] = "Get active and work closely with your team in Sports games";
    GameGenreDescriptions[GameGenreDescriptions["Fight other players, with bare hands or swords, in Fighting games"] = 13] = "Fight other players, with bare hands or swords, in Fighting games";
    GameGenreDescriptions[GameGenreDescriptions["Prospect the grand wild west and meet people in Western games"] = 14] = "Prospect the grand wild west and meet people in Western games";
})(GameGenreDescriptions = exports.GameGenreDescriptions || (exports.GameGenreDescriptions = {}));
var GameGenreThumbnails;
(function (GameGenreThumbnails) {
    GameGenreThumbnails[GameGenreThumbnails["https://cdn.blockshub.net/static/genre/comedy_genre_thumbnail.png"] = 5] = "https://cdn.blockshub.net/static/genre/comedy_genre_thumbnail.png";
    GameGenreThumbnails[GameGenreThumbnails["https://cdn.blockshub.net/static/genre/Western-small.jpg"] = 14] = "https://cdn.blockshub.net/static/genre/Western-small.jpg";
})(GameGenreThumbnails = exports.GameGenreThumbnails || (exports.GameGenreThumbnails = {}));
var GameThumbnailModerationStatus;
(function (GameThumbnailModerationStatus) {
    GameThumbnailModerationStatus[GameThumbnailModerationStatus["AwaitingApproval"] = 0] = "AwaitingApproval";
    GameThumbnailModerationStatus[GameThumbnailModerationStatus["Approved"] = 1] = "Approved";
    GameThumbnailModerationStatus[GameThumbnailModerationStatus["Declined"] = 2] = "Declined";
})(GameThumbnailModerationStatus = exports.GameThumbnailModerationStatus || (exports.GameThumbnailModerationStatus = {}));
var GameSortOptions;
(function (GameSortOptions) {
    GameSortOptions[GameSortOptions["Featured"] = 1] = "Featured";
    GameSortOptions[GameSortOptions["Top Players"] = 2] = "Top Players";
    GameSortOptions[GameSortOptions["Recently Updated"] = 3] = "Recently Updated";
})(GameSortOptions = exports.GameSortOptions || (exports.GameSortOptions = {}));
class GameInfo {
}
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "gameId", void 0);
__decorate([
    common_1.PropertyType(String),
    __metadata("design:type", String)
], GameInfo.prototype, "gameName", void 0);
__decorate([
    common_1.PropertyType(String),
    __metadata("design:type", String)
], GameInfo.prototype, "gameDescription", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "maxPlayers", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "iconAssetId", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "thumbnailAssetId", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "visitCount", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "playerCount", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "likeCount", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "dislikeCount", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "creatorId", void 0);
__decorate([
    common_1.PropertyType(String),
    __metadata("design:type", String)
], GameInfo.prototype, "createdAt", void 0);
__decorate([
    common_1.PropertyType(String),
    __metadata("design:type", String)
], GameInfo.prototype, "updatedAt", void 0);
__decorate([
    common_1.PropertyType(Number),
    __metadata("design:type", Number)
], GameInfo.prototype, "genre", void 0);
exports.GameInfo = GameInfo;
