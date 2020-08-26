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
const Users = require("./Users");
exports.Users = Users;
const Games = require("./Games");
exports.Games = Games;
const Groups = require("./Groups");
exports.Groups = Groups;
const Forums = require("./Forums");
exports.Forums = Forums;
const Catalog = require("./Catalog");
exports.Catalog = Catalog;
const Ads = require("./Ads");
exports.Ads = Ads;
const UserReferral = require("./User-Referral");
exports.UserReferral = UserReferral;
const Support = require("./Support");
exports.Support = Support;
const Staff = require("./Staff");
exports.Staff = Staff;
const common_1 = require("@tsed/common");
const Any_1 = require("../middleware/Any");
class UserSession {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], UserSession.prototype, "userId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], UserSession.prototype, "username", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], UserSession.prototype, "passwordChanged", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], UserSession.prototype, "banned", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], UserSession.prototype, "theme", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], UserSession.prototype, "primaryBalance", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], UserSession.prototype, "secondaryBalance", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], UserSession.prototype, "staff", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], UserSession.prototype, "dailyAward", void 0);
exports.UserSession = UserSession;
const crypto = require("crypto");
const config_1 = require("../helpers/config");
const versionStr = crypto.randomBytes(8).toString('hex');
class WWWTemplate {
    constructor(props) {
        this.year = new Date().getFullYear();
        this.v = versionStr;
        this.gameGenres = Games.GameGenres;
        this.env = process.env.NODE_ENV;
        this.isStaging = process.env.IS_STAGING === '1';
        this.hostName = Any_1.hostName;
        this.apiBaseUrl = config_1.default.baseUrl.frontend;
        for (const [key, value] of Object.entries(props)) {
            this[key] = value;
        }
    }
}
exports.WWWTemplate = WWWTemplate;
exports.urlEncode = (string) => {
    if (!string) {
        return "unnamed";
    }
    string = string.replace(/\s| /g, '-');
    string = string.replace(/[^a-zA-Z\d-]+/g, '');
    string = string.replace(/--/g, '-');
    if (!string) {
        return "unnamed";
    }
    return string;
};
