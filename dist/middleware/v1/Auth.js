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
const base_1 = require("../../controllers/base");
const common_1 = require("@tsed/common");
const model = require("../../models/index");
let YesAuth = class YesAuth extends base_1.default {
    use(info) {
        if (!info) {
            throw new this.Unauthorized('LoginRequired');
        }
    }
};
__decorate([
    __param(0, common_1.Locals('userInfo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession]),
    __metadata("design:returntype", void 0)
], YesAuth.prototype, "use", null);
YesAuth = __decorate([
    common_1.Middleware()
], YesAuth);
exports.YesAuth = YesAuth;
let NoAuth = class NoAuth extends base_1.default {
    use(info) {
        if (info) {
            throw new this.Unauthorized('LogoutRequired');
        }
    }
};
__decorate([
    __param(0, common_1.Locals('userInfo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession]),
    __metadata("design:returntype", void 0)
], NoAuth.prototype, "use", null);
NoAuth = __decorate([
    common_1.Middleware()
], NoAuth);
exports.NoAuth = NoAuth;
//# sourceMappingURL=Auth.js.map