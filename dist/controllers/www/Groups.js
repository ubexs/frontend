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
let GroupsController = class GroupsController extends base_1.default {
    Index() {
        return new model.WWWTemplate({
            title: 'Groups',
        });
    }
    groupCreate() {
        return new model.WWWTemplate({ 'title': 'Create a Group' });
    }
    async redirectToGroupPage(res, groupId) {
        let groupData = await this.Groups.getInfo(groupId);
        let encodedName;
        if (groupData.groupStatus !== model.Groups.groupStatus.ok) {
            encodedName = model.urlEncode('Locked Group');
        }
        else {
            encodedName = model.urlEncode(groupData.groupName);
        }
        return res.redirect("/groups/" + groupId + "/" + encodedName);
    }
    async GroupPage(groupId, groupName) {
        let groupData = await this.Groups.getInfo(groupId);
        let viewData = new model.WWWTemplate({ 'title': groupData.groupName || 'Locked Group' });
        if (groupData.groupStatus === model.Groups.groupStatus.locked) {
            viewData.page = {
                groupStatus: 1,
                groupId: groupId,
                groupEncodedName: model.urlEncode('Locked Group'),
            };
            return viewData;
        }
        viewData.page = {};
        viewData.page.groupId = groupData.groupId;
        viewData.page.groupName = groupData.groupName;
        viewData.page.groupEncodedName = model.urlEncode(groupData.groupName);
        viewData.page.groupOwnerUserId = groupData.groupOwnerUserId;
        viewData.page.groupMemberCount = groupData.groupMemberCount;
        viewData.page.groupDescription = groupData.groupDescription;
        viewData.page.groupIconCatalogId = groupData.groupIconCatalogId;
        return viewData;
    }
    async groupCatalogItemCreate(res, userInfo, groupId, groupName) {
        let groupData = await this.Groups.getInfo(groupId);
        if (groupData.groupStatus === model.Groups.groupStatus.locked) {
            throw new this.NotFound('InvalidGroupId');
        }
        let userRole = await this.Groups.getUserRole(groupId, userInfo.userId);
        const encodedName = model.urlEncode(groupData.groupName);
        if (userRole.permissions.manage === 0) {
            return res.redirect("/groups/" + groupId + "/" + encodedName);
        }
        let viewData = new model.WWWTemplate({ 'title': 'Create a Catalog Item' });
        viewData.page = {
            groupId: groupData.groupId,
            groupName: groupData.groupName,
            groupEncodedName: encodedName
        };
        return viewData;
    }
    async groupManage(userInfo, res, groupId, groupName) {
        let groupData = await this.Groups.getInfo(groupId);
        if (groupData.groupStatus === model.Groups.groupStatus.locked) {
            throw new this.NotFound('InvalidGroupId');
        }
        let userRole = await this.Groups.getUserRole(groupId, userInfo.userId);
        const encodedName = model.urlEncode(groupData.groupName);
        if (userRole.permissions.manage === 0) {
            return res.redirect("/groups/" + groupId + "/" + encodedName);
        }
        let viewData = new model.WWWTemplate({ 'title': groupData.groupName });
        viewData.page = {};
        viewData.page.groupId = groupData.groupId;
        viewData.page.groupName = groupData.groupName;
        viewData.page.groupEncodedName = encodedName;
        viewData.page.groupOwnerUserId = groupData.groupOwnerUserId;
        viewData.page.groupMemberCount = groupData.groupMemberCount;
        viewData.page.groupDescription = groupData.groupDescription;
        viewData.page.groupIconCatalogId = groupData.groupIconCatalogId;
        viewData.page.groupMembershipApprovalRequired = groupData.groupMembershipApprovalRequired;
        return viewData;
    }
};
__decorate([
    common_1.Get('/'),
    common_1.Render('groups/index'),
    swagger_1.Summary('Groups search page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "Index", null);
__decorate([
    common_1.Get('/create'),
    swagger_1.Summary('Create group page'),
    common_1.Render('group_create'),
    common_1.Use(middleware.auth.YesAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "groupCreate", null);
__decorate([
    common_1.Get('/:groupId'),
    swagger_1.Summary('Redirect /groups/{groupId} to /groups/{groupId}/{groupName} or 404 if invalid {groupId}'),
    __param(0, common_1.Res()),
    __param(1, common_1.PathParams('groupId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "redirectToGroupPage", null);
__decorate([
    common_1.Get('/:groupId/:groupName'),
    swagger_1.Summary('Group Page'),
    common_1.Render('groups/group'),
    __param(0, common_1.PathParams('groupId', Number)),
    __param(1, common_1.PathParams('groupName', String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "GroupPage", null);
__decorate([
    common_1.Get('/:groupId/:groupName/create'),
    swagger_1.Summary('Group item creation page'),
    common_1.Render('groups/create-item'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Res()),
    __param(1, common_1.Locals('userInfo')),
    __param(2, common_1.PathParams('groupId', Number)),
    __param(3, common_1.PathParams('groupName', String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, model.UserSession, Number, String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "groupCatalogItemCreate", null);
__decorate([
    common_1.Get('/:groupId/:groupName/manage'),
    swagger_1.Summary('Group manage page'),
    common_1.Render('groups/manage'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Locals('userInfo')),
    __param(1, common_1.Res()),
    __param(2, common_1.PathParams('groupId', Number)),
    __param(3, common_1.PathParams('groupName', String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession, Object, Number, String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "groupManage", null);
GroupsController = __decorate([
    common_1.Controller('/groups')
], GroupsController);
exports.GroupsController = GroupsController;
