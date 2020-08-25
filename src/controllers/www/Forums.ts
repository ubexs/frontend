import base from '../base';
import { Controller, Get, Header, HeaderParams, Render, Use, Res, Locals, PathParams, QueryParams } from '@tsed/common';
import * as model from '../../models/index';
import * as middleware from '../../middleware/v1';
import { Summary } from "@tsed/swagger";

@Controller('/forum')
export class ForumsController extends base {

    @Render('forum/index')
    @Get('/')
    public async index(
        @Locals('userInfo') userInfo: model.UserSession,
    ) {
        let subs: any;
        if (!userInfo) {
            subs = await this.Forums.getSubCategories();
        } else {
            subs = await this.Forums.getSubCategories(userInfo.staff);
        }
        for (const item of subs) {
            item.latestPost = await this.Forums.getLatestPost(item.subCategoryId);
            let counts = await this.Forums.getThreadAndPostCount(item.subCategoryId);
            item.totalThreads = counts.threads;
            item.totalPosts = counts.posts;
        }
        let cats: any[] = await this.Forums.getCategories();
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
        // grab the latest threads.
        // at most, it will return 5 or the current amount of subcategories there are (whichever is smaller)
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

    @Render('forum/search')
    @Get('/search')
    public search(
        @QueryParams('q', String) q?: string,
    ) {
        return new model.WWWTemplate({
            title: 'Search Forum',
            page: {
                query: q,
            }
        });
    }

    @Render('forum/thread_create')
    @Get('/thread/thread')
    @Use(middleware.auth.YesAuth)
    public async forumThreadCreate(
        @Locals('userInfo') userData: model.UserSession,
        @QueryParams('subid', Number) numericId: number
    ) {
        numericId = base.ValidateId(numericId);
        let rank = userData.staff;
        if (!numericId) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        let forumSubCategory = await this.Forums.getSubCategoryById(numericId);
        if (forumSubCategory.permissions.post > rank) {
            throw new this.Conflict('InvalidPermissions')
        }
        let allForumSubCategories = await this.Forums.getSubCategories(rank);
        let ViewData = new model.WWWTemplate<any>({ 'title': 'Create a thread' });
        ViewData.title = "Create a Thread";
        ViewData.page = {};
        ViewData.page.subCategoryId = forumSubCategory.subCategoryId;
        ViewData.page.subCategoryName = forumSubCategory.title;
        ViewData.page.subCategories = allForumSubCategories;
        return ViewData;
    }

    @Render('forum/create_reply')
    @Get('/thread/thread')
    @Use(middleware.auth.YesAuth)
    public async forumPostCreate(
        @Locals('userInfo') userData: model.UserSession,
        @QueryParams('threadId', Number) numericId: number,
        @QueryParams('page', Number) page?: number,
    ) {
        numericId = base.ValidateId(numericId);
        let rank = userData.staff;
        let threadInfo;
        try {
            threadInfo = await this.Forums.getThreadById(numericId);
        } catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumSubCategory = await this.Forums.getSubCategoryById(threadInfo.subCategoryId);
        if (forumSubCategory.permissions.read > rank) {
            throw new this.Conflict('InvalidPermissions');
        }
        let ViewData = new model.WWWTemplate<any>({ title: "Reply to " + '"' + forumSubCategory.title + '"' })
        ViewData.page = {};
        ViewData.page.subCategoryId = forumSubCategory.subCategoryId;
        ViewData.page.subCategoryName = forumSubCategory.title;
        ViewData.page.page = page;

        ViewData.page.threadTitle = threadInfo.title;
        ViewData.page.threadId = threadInfo.threadId;
        return ViewData;
    }

    @Render('forum/thread')
    @Get('/thread/:id')
    public async thread(
        @Res() res: Res,
        @Locals('userInfo') userData: model.UserSession,
        @PathParams('id', Number) numericId: number,
        @QueryParams('page', Number) page?: number,
    ) {
        numericId = base.ValidateId(numericId);
        let rank = 0;
        if (userData) {
            rank = userData.staff;
        }
        if (!numericId) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let ViewData = new model.WWWTemplate<any>({ title: 'Thread' });
        let threadInfo;
        ViewData.page = {};
        try {
            threadInfo = await this.Forums.getThreadById(numericId);
            if (threadInfo.threadDeleted === model.Forums.threadDeleted.true) {
                threadInfo.title = '[ Deleted ' + threadInfo.threadId + ' ]';
                ViewData.page.deleted = true;
            }
        } catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumSubCategory: model.Forums.SubCategories;
        try {
            forumSubCategory = await this.Forums.getSubCategoryById(threadInfo.subCategoryId);
            if (forumSubCategory.permissions.read > rank) {
                throw false;
            }
        } catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumCategory: model.Forums.Categories;
        try {
            forumCategory = await this.Forums.getCategoryById(forumSubCategory.categoryId);
        } catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        if (typeof page !== 'number' || page <= 0) {
            page = 1;
        }
        // category info
        ViewData.page.categoryName = forumCategory.title;
        // subcategory info
        ViewData.page.subCategoryId = forumSubCategory.subCategoryId;
        ViewData.page.subCategoryName = forumSubCategory.title;
        ViewData.page.page = page;
        // thread info
        ViewData.title = threadInfo.title + " :: " + forumSubCategory.title;
        ViewData.page.threadTitle = threadInfo.title;
        ViewData.page.threadId = threadInfo.threadId;
        ViewData.page.threadLocked = threadInfo.threadLocked;
        ViewData.page.threadPinned = threadInfo.threadPinned;
        return ViewData;
    }


    @Render('forum/subcategory')
    @Get('/:subCategoryId')
    public async subCategory(
        @Res() res: Res,
        @Locals('userInfo') userData: model.UserSession,
        @PathParams('subCategoryId', Number) numericId: number,
        @QueryParams('page', Number) page?: number,
    ) {
        numericId = base.ValidateId(numericId);
        let rank = 0;
        if (userData) {
            rank = userData.staff;
        }
        if (!numericId) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        let forumSubCategory: model.Forums.SubCategories;
        try {
            forumSubCategory = await this.Forums.getSubCategoryById(numericId);
            if (forumSubCategory.permissions.read > rank) {
                throw false;
            }
        } catch (e) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        // grab category info
        let forumCategory;
        try {
            forumCategory = await this.Forums.getCategoryById(forumSubCategory.categoryId);
        } catch (e) {
            throw new this.BadRequest('InvalidCategoryId');
        }
        let allForumSubCategories: model.Forums.SubCategories[];
        try {
            allForumSubCategories = await this.Forums.getSubCategories(rank);
        } catch (e) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        if (typeof page !== 'number' || page <= 0) {
            page = 1;
        }
        let ViewData = new model.WWWTemplate<any>({ title: forumSubCategory.title });
        ViewData.page = {};
        ViewData.page.subCategoryId = forumSubCategory.subCategoryId;
        ViewData.page.subCategoryName = forumSubCategory.title;
        ViewData.page.page = page;
        ViewData.page.subCategories = allForumSubCategories;
        ViewData.page.categoryId = forumSubCategory.categoryId;
        ViewData.page.categoryName = forumCategory.title;
        return ViewData;
    }
}