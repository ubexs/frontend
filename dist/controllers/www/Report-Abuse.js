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
const model = require("../../models");
const base_1 = require("../base");
const middleware = require("../../middleware/v1");
let ReportAbuseController = class ReportAbuseController extends base_1.default {
    constructor() {
        super();
    }
    reportUserStatus(userStatusId) {
        userStatusId = base_1.default.ValidateId(userStatusId);
        return new model.WWWTemplate({
            title: 'Report Abuse',
            page: {
                userStatusId: userStatusId,
            }
        });
    }
};
__decorate([
    common_1.Get('/user-status/:userStatusId'),
    common_1.Render('report-abuse/user-status'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.PathParams('userStatusId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReportAbuseController.prototype, "reportUserStatus", null);
ReportAbuseController = __decorate([
    common_1.Controller("/report-abuse"),
    __metadata("design:paramtypes", [])
], ReportAbuseController);
exports.ReportAbuseController = ReportAbuseController;
