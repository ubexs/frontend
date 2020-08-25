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
}
exports.default = Staff;
//# sourceMappingURL=Staff.js.map