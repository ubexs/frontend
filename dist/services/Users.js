"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Users extends base_1.default {
    constructor(data) {
        super();
        if (data) {
            const updatedBase = new base_1.default({
                cookie: data.cookie,
            });
            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    async getInfo(userId) {
        const info = await this.v1.get('/user/' + userId + '/info');
        return info.data;
    }
    async getBanData() {
        const info = await this.v1.get('/auth/ban');
        return info.data;
    }
    async getAuthenticatedUserInfo() {
        const info = await this.v1.get('/auth/current-user');
        return info.data;
    }
    async getPastUsernames(userId) {
        const results = await this.v1.get('/user/' + userId + '/past-usernames');
        let pastNames = [];
        for (const name of results.data) {
            pastNames.push(name.username);
        }
        return pastNames;
    }
}
exports.default = Users;
