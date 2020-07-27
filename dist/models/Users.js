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
exports.Info = Info;
//# sourceMappingURL=Users.js.map