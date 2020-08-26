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
var banned;
(function (banned) {
    banned[banned["true"] = 1] = "true";
    banned[banned["false"] = 0] = "false";
})(banned = exports.banned || (exports.banned = {}));
var theme;
(function (theme) {
    theme[theme["light"] = 0] = "light";
    theme[theme["dark"] = 1] = "dark";
})(theme = exports.theme || (exports.theme = {}));
var staff;
(function (staff) {
    staff[staff["false"] = 0] = "false";
    staff[staff["true"] = 1] = "true";
})(staff = exports.staff || (exports.staff = {}));
class Info {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], Info.prototype, "userId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], Info.prototype, "username", void 0);
__decorate([
    common_1.Required(),
    common_1.AllowTypes('string', 'null'),
    __metadata("design:type", Object)
], Info.prototype, "status", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], Info.prototype, "joinDate", void 0);
__decorate([
    common_1.Required(),
    common_1.AllowTypes('string', 'null'),
    __metadata("design:type", Object)
], Info.prototype, "blurb", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], Info.prototype, "banned", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], Info.prototype, "lastOnline", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], Info.prototype, "tradingEnabled", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], Info.prototype, "staff", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], Info.prototype, "accountStatus", void 0);
exports.Info = Info;
class AuthenticatedInfo {
}
exports.AuthenticatedInfo = AuthenticatedInfo;
class ModerationAction {
}
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], ModerationAction.prototype, "id", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], ModerationAction.prototype, "userId", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], ModerationAction.prototype, "reason", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", String)
], ModerationAction.prototype, "date", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Object)
], ModerationAction.prototype, "untilUnbanned", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Number)
], ModerationAction.prototype, "terminated", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Boolean)
], ModerationAction.prototype, "unlock", void 0);
__decorate([
    common_1.Required(),
    __metadata("design:type", Boolean)
], ModerationAction.prototype, "isEligibleForAppeal", void 0);
exports.ModerationAction = ModerationAction;
var terminated;
(function (terminated) {
    terminated[terminated["true"] = 1] = "true";
    terminated[terminated["false"] = 0] = "false";
})(terminated = exports.terminated || (exports.terminated = {}));
