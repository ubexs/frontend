"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Support extends base_1.default {
    constructor(data) {
        super();
        if (data) {
            const updatedBase = new base_1.default(data);
            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    async metadata() {
        const replies = await this.v1.get('/trade-ads/metadata');
        return replies.data;
    }
}
exports.default = Support;
