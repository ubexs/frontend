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
const common_1 = require("@tsed/common");
const model = require("../../models/");
const middleware = require("../../middleware/v1");
const base_1 = require("../base");
let CurrencyExchangeController = class CurrencyExchangeController extends base_1.default {
    constructor() {
        super();
    }
    async subCategory(userData) {
        return new model.WWWTemplate({ title: 'Currency Exchange' });
    }
};
__decorate([
    common_1.Render('currency-exchange/index'),
    common_1.Get('/'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Locals('userInfo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession]),
    __metadata("design:returntype", Promise)
], CurrencyExchangeController.prototype, "subCategory", null);
CurrencyExchangeController = __decorate([
    common_1.Controller("/currency-exchange"),
    __metadata("design:paramtypes", [])
], CurrencyExchangeController);
exports.CurrencyExchangeController = CurrencyExchangeController;
//# sourceMappingURL=Currency-Exchange.js.map