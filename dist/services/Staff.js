"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Staff extends base_1.default {
    constructor(data) {
        super();
        if (data) {
            const updatedBase = new base_1.default(data);
            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    async getPermissions(userId) {
        const info = await this.v1.get('/staff/permissions/' + userId);
        let permissionArray = [];
        for (let perm in info.data) {
            let num = parseInt(perm, 10);
            if (Number.isInteger(num)) {
                permissionArray.push(num);
            }
        }
        return permissionArray;
    }
    getModerationHistory(userId) {
        return this.v1.get('/staff/user/moderation-history?userId=' + userId).then(d => { return d.data; });
    }
    getUserEmail(userId) {
        return this.v1.get('/staff/user/email?userId=' + userId).then(d => { return d.data; });
    }
    getUserEmails(userId) {
        return this.v1.get('/staff/user/emails?userId=' + userId).then(d => { return d.data; });
    }
    searchUsers(req) {
        return this.v1.get('/staff/user/search?userId=' + (req.userId || '') + '&username=' + (req.username || '') + '&email=' + (req.email || '')).then(d => { return d.data; });
    }
    getUserCountry(userId) {
        return this.v1.get('/staff/user/' + userId + '/country').then(d => { return d.data; });
    }
}
exports.default = Staff;
