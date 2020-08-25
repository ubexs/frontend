"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class UserReferral extends base_1.default {
    constructor(data) {
        super();
        if (data) {
            const updatedBase = new base_1.default(data);
            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    async getInfoById(referralId) {
        const info = await this.v1.get('/user-referral/code/' + referralId + '/info');
        return info.data;
    }
}
exports.default = UserReferral;
//# sourceMappingURL=User-Referral.js.map