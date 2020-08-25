"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Catalog extends base_1.default {
    constructor(data) {
        super();
        if (data) {
            const updatedBase = new base_1.default(data);
            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    async getInfo(catalogId) {
        return (await this.v1.get('/catalog/' + catalogId + '/info')).data;
    }
    async countSales(catalogId) {
        return (await this.v1.get('/catalog/' + catalogId + '/sales/count')).data;
    }
    async countAllItemsForSale() {
        return (await this.v1.get('/catalog/all-items/count')).data;
    }
}
exports.default = Catalog;
//# sourceMappingURL=Catalog.js.map