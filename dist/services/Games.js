"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Games extends base_1.default {
    constructor(data) {
        super();
        if (data) {
            const updatedBase = new base_1.default(data);
            this.v1 = updatedBase.v1;
            this.v2 = updatedBase.v2;
        }
    }
    async getInfo(gameId) {
        const info = await this.v1.get('/game/' + gameId + '/info');
        return info.data;
    }
    async getGameThumbnail(gameId) {
        const info = await this.v1.get('/game/' + gameId + '/thumbnail');
        return info.data;
    }
}
exports.default = Games;
