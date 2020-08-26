"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Groups extends base_1.default {
    constructor(data) {
        super();
        if (data) {
            const updatedBase = new base_1.default(data);
            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    async getInfo(groupId) {
        const info = await this.v1.get('/group/' + groupId + '/info');
        return info.data;
    }
    async getUserRole(groupId, userId) {
        const roleInfo = await this.v1.get(`/user/${userId}/groups/${groupId}/role`);
        return roleInfo.data;
    }
}
exports.default = Groups;
