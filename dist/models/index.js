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
const users = require("./Users");
exports.users = users;
const game = require("./Game");
exports.game = game;
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
const versionStr = crypto.randomBytes(8).toString('hex');
class WWWTemplate {
    constructor(props) {
        this.year = new Date().getFullYear();
        this.page = {};
        this.v = versionStr;
        this.gameGenres = game.GameGenres;
        this.env = process.env.NODE_ENV;
        this.isStaging = process.env.IS_STAGING === '1';
        this.hostName = Any_1.hostName;
        for (const [key, value] of Object.entries(props)) {
            this[key] = value;
        }
    }
}
exports.WWWTemplate = WWWTemplate;
//# sourceMappingURL=index.js.map