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
        @HeaderParams('cookie') cookie: string,
        @Locals('userInfo') userInfo?: model.UserSession,
    ) {
        let s = new base({ cookie })
        let subs: any;
        if (!userInfo) {
            subs = await s.Forums.getSubCategories();
        } else {
            subs = await s.Forums.getSubCategories(userInfo.staff);
        }
        for (const item of subs) {
            item.latestPost = await s.Forums.getLatestPost(item.subCategoryId);
            let counts = await s.Forums.getThreadAndPostCount(item.subCategoryId);
            item.totalThreads = counts.threads;
            item.totalPosts = counts.posts;
        }
        let cats: any[] = await s.Forums.getCategories();
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
        let latestThreads = await s.Forums.getLatestThreads(subs.length >= 5 ? 5 : subs.length);
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
        @HeaderParams('cookie') cookie: string,
        @Locals('userInfo') userData: model.UserSession,
        @QueryParams('subid', Number) numericId: number
    ) {
        let s = new base({ cookie });
        let rank = userData.staff;
        if (!numericId) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        let forumSubCategory = await s.Forums.getSubCategoryById(numericId);
        if (forumSubCategory.permissions.post > rank) {
            throw new this.Conflict('InvalidPermissions')
        }
        let allForumSubCategories = await s.Forums.getSubCategories(rank);
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
        @HeaderParams('cookie') cookie: string,
        @Locals('userInfo') userData: model.UserSession,
        @QueryParams('threadId', Number) numericId: number,
        @QueryParams('page', Number) page?: number,
    ) {
        let s = new base({ cookie });
        let rank = userData.staff;
        let threadInfo;
        try {
            threadInfo = await s.Forums.getThreadById(numericId);
        } catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumSubCategory = await s.Forums.getSubCategoryById(threadInfo.subCategoryId);
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
        @HeaderParams('cookie') cookie: string,
        @PathParams('id', Number) numericId: number,
        @QueryParams('page', Number) page?: number,
    ) {
        let rank = 0;
        if (userData) {
            rank = userData.staff;
        }
        if (!numericId) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let ViewData = new model.WWWTemplate<any>({ title: 'Thread' });
        let s = new base({
            cookie,
        });
        let threadInfo;
        ViewData.page = {};
        try {
            threadInfo = await s.Forums.getThreadById(numericId);
            if (threadInfo.threadDeleted === model.Forums.threadDeleted.true) {
                threadInfo.title = '[ Deleted ' + threadInfo.threadId + ' ]';
                ViewData.page.deleted = true;
            }
        } catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumSubCategory: model.Forums.SubCategories;
        try {
            forumSubCategory = await s.Forums.getSubCategoryById(threadInfo.subCategoryId);
            if (forumSubCategory.permissions.read > rank) {
                throw false;
            }
        } catch (e) {
            throw new this.BadRequest('InvalidThreadId');
        }
        let forumCategory: model.Forums.Categories;
        try {
            forumCategory = await s.Forums.getCategoryById(forumSubCategory.categoryId);
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
        @HeaderParams('cookie') cookie: string,
        @QueryParams('page', Number) page?: number,
    ) {
        let s = new base({
            cookie,
        });
        let rank = 0;
        if (userData) {
            rank = userData.staff;
        }
        if (!numericId) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        let forumSubCategory: model.Forums.SubCategories;
        try {
            forumSubCategory = await s.Forums.getSubCategoryById(numericId);
            if (forumSubCategory.permissions.read > rank) {
                throw false;
            }
        } catch (e) {
            throw new this.BadRequest('InvalidSubCategoryId');
        }
        // grab category info
        let forumCategory;
        try {
            forumCategory = await s.Forums.getCategoryById(forumSubCategory.categoryId);
        } catch (e) {
            throw new this.BadRequest('InvalidCategoryId');
        }
        let allForumSubCategories: model.Forums.SubCategories[];
        try {
            allForumSubCategories = await s.Forums.getSubCategories(rank);
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