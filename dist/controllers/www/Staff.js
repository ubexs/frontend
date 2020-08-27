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
const base_1 = require("../base");
const model = require("../../models");
const middleware = require("../../middleware/v1");
const { YesAuth, NoAuth } = middleware.auth;
let WWWStaffController = class WWWStaffController extends base_1.default {
    constructor() {
        super();
    }
    listOfStaff() {
        return new model.WWWTemplate({ title: 'Staff' });
    }
    directoryStaff() {
        return new model.WWWTemplate({ title: 'Staff Directory' });
    }
    createItem() {
        return new model.WWWTemplate({ title: 'Staff Create' });
    }
    currencyProductEditor() {
        return new model.WWWTemplate({ title: 'Currency Products' });
    }
    ban() {
        return new model.WWWTemplate({ title: 'Ban a User' });
    }
    unban() {
        return new model.WWWTemplate({ title: 'Unban a User' });
    }
    resetPassword() {
        return new model.WWWTemplate({ title: 'Reset a password' });
    }
    catalogPending() {
        return new model.WWWTemplate({ title: 'Items Awaiting Moderator Approval' });
    }
    reportAbuseUserStatus() {
        return new model.WWWTemplate({ title: 'User Status Reports' });
    }
    giveItem() {
        return new model.WWWTemplate({ title: 'Give an Item' });
    }
    giveCurrency() {
        return new model.WWWTemplate({ title: 'Give Currency' });
    }
    async modifyUserInventory(userId) {
        userId = base_1.default.ValidateId(userId);
        let infoOfUserToEdit = await this.Users.getInfo(userId);
        return new model.WWWTemplate({
            title: 'Modify User Inventory', page: {
                profileData: infoOfUserToEdit
            }
        });
    }
    editBanner() {
        return new model.WWWTemplate({ title: 'Edit Banner' });
    }
    async moderationProfile(localUserData, userId, req) {
        const staff = localUserData.staff > 1;
        if (!staff) {
            throw new this.BadRequest('InvalidPermissions');
        }
        let s = new base_1.default({ cookie: req.headers['cookie'] });
        let userInfo = await s.Users.getInfo(userId);
        let moderationHistory;
        let isOnline = false;
        let isOver13 = false;
        let isEmailVerified = false;
        let userEmails = [];
        let twoFactorEnabled = false;
        let allStaffPermissionTypes = model.Staff.Permission;
        let alreadySelectedPermissions = await s.Staff.getPermissions(userId);
        try {
            userInfo = await s.Users.getInfo(userId, ['accountStatus', 'userId', 'username', 'primaryBalance', 'secondaryBalance', 'blurb', 'staff', 'birthDate', 'dailyAward', 'lastOnline', 'status', 'joinDate', 'forumSignature', '2faEnabled', 'isDeveloper']);
            if (userInfo['2faEnabled'] === 1) {
                twoFactorEnabled = true;
            }
            if (this.moment().isSameOrAfter(this.moment(userInfo.birthDate).add(13, 'years'))) {
                isOver13 = true;
            }
            if (this.moment(userInfo.lastOnline).isSameOrAfter(this.moment().subtract(5, 'minutes'))) {
                isOnline = true;
            }
            moderationHistory = await s.Staff.getModerationHistory(userId);
            const emailInfo = await s.Staff.getUserEmail(userId);
            if (emailInfo && emailInfo.status === 1) {
                isEmailVerified = true;
            }
            userEmails = await s.Staff.getUserEmails(userId);
        }
        catch (e) {
            console.log(e);
            throw new this.BadRequest('InvalidUserId');
        }
        let ViewData = new model.WWWTemplate({ 'title': userInfo.username + "'s Moderation Profile" });
        ViewData.page = {};
        ViewData.page.online = isOnline;
        ViewData.page.isOver13 = isOver13;
        ViewData.page.isEmailVerified = isEmailVerified;
        ViewData.page.userInfo = userInfo;
        ViewData.page.ModerationHistory = moderationHistory;
        ViewData.page.userEmails = userEmails;
        ViewData.page.twoFactorEnabled = twoFactorEnabled;
        const staffPermissionSelect = [];
        let currentUserInfo = await s.Staff.getPermissions(userInfo.userId);
        if (currentUserInfo.includes(model.Staff.Permission.ManageStaff) || localUserData.staff >= 100) {
            for (const perm of alreadySelectedPermissions) {
                let int = parseInt(perm, 10);
                if (!isNaN(int)) {
                    let str = model.Staff.Permission[int];
                    staffPermissionSelect.push({
                        string: str,
                        selected: true,
                    });
                }
            }
            for (const extraPerm in allStaffPermissionTypes) {
                let int = parseInt(extraPerm, 10);
                if (isNaN(int)) {
                    let isIncluded = false;
                    for (const val of staffPermissionSelect) {
                        if (val.string === extraPerm) {
                            isIncluded = true;
                            break;
                        }
                    }
                    if (!isIncluded) {
                        staffPermissionSelect.push({
                            string: extraPerm,
                            selected: false,
                        });
                    }
                }
            }
        }
        ViewData.page.staffPermissionSelect = staffPermissionSelect;
        return ViewData;
    }
    async moderationGroup(groupId) {
        groupId = base_1.default.ValidateId(groupId);
        let groupInfo = await this.Groups.getInfo(groupId);
        let ViewData = new model.WWWTemplate({ 'title': "Manage \"" + groupInfo.groupName + "\"" });
        ViewData.page = {
            groupInfo: groupInfo,
        };
        return ViewData;
    }
    async modifyForums() {
        let cats = await this.Forums.getCategories();
        let subs = await this.Forums.getSubCategories();
        for (const sub of subs) {
            for (const cat of cats) {
                if (sub.categoryId === cat.categoryId) {
                    sub['category'] = cat;
                }
            }
        }
        return new model.WWWTemplate({
            title: 'Modify Forum Categories/SubCategories',
            page: {
                subs: subs,
                cats: cats,
            }
        });
    }
    staffTickets() {
        return new model.WWWTemplate({ title: 'View Tickets Awaiting Response' });
    }
    searchUsers() {
        return new model.WWWTemplate({ title: 'Search Users' });
    }
};
__decorate([
    common_1.Get('/staff'),
    common_1.Render('staff_users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "listOfStaff", null);
__decorate([
    common_1.Get('/staff/directory'),
    common_1.Use(YesAuth),
    common_1.Render('staff/index'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "directoryStaff", null);
__decorate([
    common_1.Get('/staff/create'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.UploadStaffAssets)),
    common_1.Render('staff/create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "createItem", null);
__decorate([
    common_1.Get('/staff/currency-product'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageCurrencyProducts)),
    common_1.Render('staff/currency_product'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "currencyProductEditor", null);
__decorate([
    common_1.Get('/staff/ban'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.BanUser)),
    common_1.Render('staff/ban'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "ban", null);
__decorate([
    common_1.Get('/staff/unban'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.UnbanUser)),
    common_1.Render('staff/unban'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "unban", null);
__decorate([
    common_1.Get('/staff/password'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ResetPassword)),
    common_1.Render('staff/password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "resetPassword", null);
__decorate([
    common_1.Get('/staff/catalog'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewPendingItems)),
    common_1.Render('staff/catalog_moderation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "catalogPending", null);
__decorate([
    common_1.Get('/staff/report-abuse/user-status'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewAbuseReports)),
    common_1.Render('staff/report-abuse/user-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "reportAbuseUserStatus", null);
__decorate([
    common_1.Get('/staff/give'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveItemToUser)),
    common_1.Render('staff/give'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "giveItem", null);
__decorate([
    common_1.Get('/staff/give/currency'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveCurrencyToUser)),
    common_1.Render('staff/give_currency'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "giveCurrency", null);
__decorate([
    common_1.Get('/staff/user/inventory'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.GiveItemToUser, model.Staff.Permission.TakeItemFromUser)),
    common_1.Render('staff/user/inventory'),
    __param(0, common_1.Required()),
    __param(0, common_1.QueryParams('userId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WWWStaffController.prototype, "modifyUserInventory", null);
__decorate([
    common_1.Get('/staff/banner'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageBanner)),
    common_1.Render('staff/banner'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "editBanner", null);
__decorate([
    common_1.Get('/staff/user/profile'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewUserInformation)),
    common_1.Render('staff/user/profile'),
    __param(0, common_1.Locals('userInfo')),
    __param(1, common_1.QueryParams('userId')),
    __param(2, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession, Object, Object]),
    __metadata("design:returntype", Promise)
], WWWStaffController.prototype, "moderationProfile", null);
__decorate([
    common_1.Get('/staff/groups/manage'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageGroup)),
    common_1.Render('staff/groups/manage'),
    __param(0, common_1.Required()),
    __param(0, common_1.QueryParams('groupId', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WWWStaffController.prototype, "moderationGroup", null);
__decorate([
    common_1.Get('/staff/forums'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageForumCategories)),
    common_1.Render('staff/forums'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WWWStaffController.prototype, "modifyForums", null);
__decorate([
    common_1.Get('/staff/tickets'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ManageSupportTickets)),
    common_1.Render('staff/tickets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "staffTickets", null);
__decorate([
    common_1.Get('/staff/user/search'),
    common_1.Use(YesAuth, middleware.staff.validate(model.Staff.Permission.ReviewUserInformation)),
    common_1.Render('staff/user/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WWWStaffController.prototype, "searchUsers", null);
WWWStaffController = __decorate([
    common_1.Controller("/"),
    common_1.UseBefore(middleware.staff.AddPermissionsToLocals),
    __metadata("design:paramtypes", [])
], WWWStaffController);
exports.WWWStaffController = WWWStaffController;
