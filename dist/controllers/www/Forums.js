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
let ForumsController = class ForumsController extends base_1.default {
    async index(userInfo) {
        let subs;
        if (!userInfo) {
            subs = await this.Forums.getSubCategories();
        }
        else {
            subs = await this.Forums.getSubCategories(userInfo.staff);
        }
        for (const item of subs) {
            item.latestPost = await this.Forums.getLatestPost(item.subCategoryId);
            let counts = await this.Forums.getThreadAndPostCount(item.subCategoryId);
            item.totalThreads = counts.threads;
            item.totalPosts = counts.posts;
        }
        let cats = await this.Forums.getCategories();
        for (const cat of cats) {
            if (!cat['subCategories']) {
                cat['subCategories'] = [];
            }
            for (const sub of subs) {
                if (sub.categoryId === cat.categoryId) {
                    cat['subCategories'].push(sub);
                }
            }
        }
        let latestThreads = await this.Forums.getLatestThreads(subs.length >= 5 ? 5 : subs.length);
        return new model.WWWTemplate({
            title: 'Forum',
            page: {
                subs: subs,
                cats: cats,
                latestThreads: latestThreads,
            }
        });
    }
    search(q) {
        return new model.WWWTemplate({
            title: 'Search Forum',
            page: {
                query: q,
            }
        });
    }
    async forumThreadCreate(userData, numericId) {
        let rank = userData.staff;
        if (!numericId) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        let forumSubCategory = await this.Forums.getSubCategoryById(numericId);
        if (forumSubCategory.permissions.post > rank) {
            throw new this.Conflict('InvalidPermissions');
        }
        let allForumSubCategories = await this.Forums.getSubCategories(rank);
        let ViewData = new model.WWWTemplate({ 'title': 'Create a thread' });
        ViewData.title = "Create a Thread";
        ViewData.page = {};
        ViewData.page.subCategoryId = forumSubCategory.subCategoryId;
        ViewData.page.subCategoryName = forumSubCategory.title;
        ViewData.page.subCategories = allForumSubCategories;
        return ViewData;
    }
    async forumPostCreate(userData, numericId, page) {
        let rank = userData.staff;
        let threadInfo;
        try {
            threadInfo = await this.Forums.getThreadById(numericId);
        }
        catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumSubCategory = await this.Forums.getSubCategoryById(threadInfo.subCategoryId);
        if (forumSubCategory.permissions.read > rank) {
            throw new this.Conflict('InvalidPermissions');
        }
        let ViewData = new model.WWWTemplate({ title: "Reply to " + '"' + forumSubCategory.title + '"' });
        ViewData.page = {};
        ViewData.page.subCategoryId = forumSubCategory.subCategoryId;
        ViewData.page.subCategoryName = forumSubCategory.title;
        ViewData.page.page = page;
        ViewData.page.threadTitle = threadInfo.title;
        ViewData.page.threadId = threadInfo.threadId;
        return ViewData;
    }
    async thread(res, userData, numericId, page) {
        let rank = 0;
        if (userData) {
            rank = userData.staff;
        }
        if (!numericId) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let ViewData = new model.WWWTemplate({ title: 'Thread' });
        let threadInfo;
        ViewData.page = {};
        try {
            threadInfo = await this.Forums.getThreadById(numericId);
            if (threadInfo.threadDeleted === model.Forums.threadDeleted.true) {
                threadInfo.title = '[ Deleted ' + threadInfo.threadId + ' ]';
                ViewData.page.deleted = true;
            }
        }
        catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumSubCategory;
        try {
            forumSubCategory = await this.Forums.getSubCategoryById(threadInfo.subCategoryId);
            if (forumSubCategory.permissions.read > rank) {
                throw false;
            }
        }
        catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumCategory;
        try {
            forumCategory = await this.Forums.getCategoryById(forumSubCategory.categoryId);
        }
        catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        if (typeof page !== 'number' || page <= 0) {
            page = 1;
        }
        ViewData.page.categoryName = forumCategory.title;
        ViewData.page.subCategoryId = forumSubCategory.subCategoryId;
        ViewData.page.subCategoryName = forumSubCategory.title;
        ViewData.page.page = page;
        ViewData.title = threadInfo.title + " :: " + forumSubCategory.title;
        ViewData.page.threadTitle = threadInfo.title;
        ViewData.page.threadId = threadInfo.threadId;
        ViewData.page.threadLocked = threadInfo.threadLocked;
        ViewData.page.threadPinned = threadInfo.threadPinned;
        return ViewData;
    }
    async subCategory(res, userData, numericId, page) {
        let rank = 0;
        if (userData) {
            rank = userData.staff;
        }
        if (!numericId) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        let forumSubCategory;
        try {
            forumSubCategory = await this.Forums.getSubCategoryById(numericId);
            if (forumSubCategory.permissions.read > rank) {
                throw false;
            }
        }
        catch (e) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        let forumCategory;
        try {
            forumCategory = await this.Forums.getCategoryById(forumSubCategory.categoryId);
        }
        catch (e) {
            throw new this.BadRequest('InvalidCategoryId');
        }
        let allForumSubCategories;
        try {
            allForumSubCategories = await this.Forums.getSubCategories(rank);
        }
        catch (e) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        if (typeof page !== 'number' || page <= 0) {
            page = 1;
        }
        let ViewData = new model.WWWTemplate({ title: forumSubCategory.title });
        ViewData.page = {};
        ViewData.page.subCategoryId = forumSubCategory.subCategoryId;
        ViewData.page.subCategoryName = forumSubCategory.title;
        ViewData.page.page = page;
        ViewData.page.subCategories = allForumSubCategories;
        ViewData.page.categoryId = forumSubCategory.categoryId;
        ViewData.page.categoryName = forumCategory.title;
        return ViewData;
    }
};
__decorate([
    common_1.Render('forum/index'),
    common_1.Get('/'),
    __param(0, common_1.Locals('userInfo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession]),
    __metadata("design:returntype", Promise)
], ForumsController.prototype, "index", null);
__decorate([
    common_1.Render('forum/search'),
    common_1.Get('/search'),
    __param(0, common_1.QueryParams('q', String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ForumsController.prototype, "search", null);
__decorate([
    common_1.Render('forum/thread_create'),
    common_1.Get('/thread/thread'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Locals('userInfo')),
    __param(1, common_1.QueryParams('subid', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession, Number]),
    __metadata("design:returntype", Promise)
], ForumsController.prototype, "forumThreadCreate", null);
__decorate([
    common_1.Render('forum/create_reply'),
    common_1.Get('/thread/thread'),
    common_1.Use(middleware.auth.YesAuth),
    __param(0, common_1.Locals('userInfo')),
    __param(1, common_1.QueryParams('threadId', Number)),
    __param(2, common_1.QueryParams('page', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model.UserSession, Number, Number]),
    __metadata("design:returntype", Promise)
], ForumsController.prototype, "forumPostCreate", null);
__decorate([
    common_1.Render('forum/thread'),
    common_1.Get('/thread/:id'),
    __param(0, common_1.Res()),
    __param(1, common_1.Locals('userInfo')),
    __param(2, common_1.PathParams('id', Number)),
    __param(3, common_1.QueryParams('page', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, model.UserSession, Number, Number]),
    __metadata("design:returntype", Promise)
], ForumsController.prototype, "thread", null);
__decorate([
    common_1.Render('forum/subcategory'),
    common_1.Get('/:subCategoryId'),
    __param(0, common_1.Res()),
    __param(1, common_1.Locals('userInfo')),
    __param(2, common_1.PathParams('subCategoryId', Number)),
    __param(3, common_1.QueryParams('page', Number)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, model.UserSession, Number, Number]),
    __metadata("design:returntype", Promise)
], ForumsController.prototype, "subCategory", null);
ForumsController = __decorate([
    common_1.Controller('/forum')
], ForumsController);
exports.ForumsController = ForumsController;
