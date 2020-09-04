"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Forums extends base_1.default {
    constructor(data) {
        super();
        if (data) {
            const updatedBase = new base_1.default(data);
            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    async multiGetUserForumInfo(userId) {
        const info = await this.v1.get('/user/forum?ids=' + encodeURIComponent(userId.join(',')));
        return info.data;
    }
    async getThreadById(threadId) {
        const info = await this.v1.get('/forum/thread/' + threadId + '/info');
        return info.data;
    }
    async getCategories() {
        const info = await this.v1.get('/forum/categories');
        return info.data;
    }
    async getCategoryById(id) {
        const cats = await this.getCategories();
        let found = undefined;
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
    async getSubCategories(minRank = 0) {
        const info = await this.v1.get('/forum/subcategories');
        info.data = info.data.filter((val) => {
            return val.permissions.read <= minRank;
        });
        return info.data;
    }
    async getSubCategoryById(subCategoryId) {
        const subs = await this.getSubCategories();
        let found = undefined;
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
    async getLatestPost(subCategoryId) {
        const info = await this.v1.get('/forum/' + subCategoryId + '/latest-post');
        return info.data;
    }
    async getThreadAndPostCount(subCategoryId) {
        const info = await this.v1.get('/forum/' + subCategoryId + '/count');
        return info.data;
    }
    async getLatestThreads(subCategoryId) {
        const info = await this.v1.get('/forum/' + subCategoryId + '/latest-threads');
        return info.data;
    }
}
exports.default = Forums;
