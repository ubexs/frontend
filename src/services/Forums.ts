import base, { IBaseOptions } from './base';
import * as model from '../models/index';
export default class Forums extends base {

    constructor(data?: IBaseOptions) {
        super();
        if (data) {
            const updatedBase = new base(data);

            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    /**
     * Multi-get user forum information by the {userId}
     * @param userId
     */
    public async multiGetUserForumInfo(userId: number[]): Promise<model.Forums.UserForumsInfo[]> {
        const info = await this.v1.get('/user/forum?ids=' + encodeURIComponent(userId.join(',')));
        return info.data;
    }

    /**
     * Get thread data by the {threadId}
     * @param threadId
     */
    public async getThreadById(threadId: number): Promise<model.Forums.Thread> {
        const info = await this.v1.get('/forum/thread/' + threadId + '/info');
        return info.data;
    }

    /**
     * Get all categories
     */
    public async getCategories(): Promise<model.Forums.Categories[]> {
        const info = await this.v1.get('/forum/categories');
        return info.data;
    }

    /**
     * Get category by the {categoryId}
     * @param id Category to get
     */
    public async getCategoryById(id: number): Promise<model.Forums.Categories> {
        const cats = await this.getCategories();
        let found: any = undefined;
        for (const cat of cats) {
            if (cat.categoryId === id) {
                found = cat;
            }
        }
        if (!found) {
            throw new this.NotFound('InvalidSubCategoryId');
        }
        return found;
    }

    /**
     * Get all subcategories
     * @param minRank Minimum rank to read a post in the category. Defaults to 0
     */
    public async getSubCategories(minRank: number = 0): Promise<model.Forums.SubCategories[]> {
        const info = await this.v1.get('/forum/subcategories');
        info.data = info.data.filter((val: model.Forums.SubCategories) => {
            return val.permissions.read <= minRank;
        })
        return info.data;
    }

    public async getSubCategoryById(subCategoryId: number): Promise<model.Forums.SubCategories> {
        const subs = await this.getSubCategories();
        let found: any = undefined;
        for (const sub of subs) {
            if (sub.subCategoryId === subCategoryId) {
                found = sub;
            }
        }
        if (!found) {
            throw new this.NotFound('InvalidSubCategoryId');
        }
        return found;
    }

    /**
     * Get latest post snipped for the {subCategoryId}
     * @param subCategoryId
     */
    public async getLatestPost(subCategoryId: number): Promise<model.Forums.PostSnippet | undefined> {
        const info = await this.v1.get('/forum/' + subCategoryId + '/latest-post');
        return info.data;
    }

    /**
     * Count the threads and posts for the {subCategoryId}
     * @param subCategoryId
     */
    public async getThreadAndPostCount(subCategoryId: number): Promise<{ threads: number; posts: number; }> {
        const info = await this.v1.get('/forum/' + subCategoryId + '/count');
        return info.data;
    }

    /**
     * Get latest threads for the {subCategoryId}
     * @param subCategoryId
     */
    public async getLatestThreads(subCategoryId: number): Promise<model.Forums.Thread[]> {
        const info = await this.v1.get('/forum/' + subCategoryId + '/latest-threads');
        return info.data;
    }

}