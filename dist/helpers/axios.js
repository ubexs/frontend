"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const config_1 = require("./config");
const client = axios_1.default.create({
    baseURL: config_1.default.baseUrl,
});
exports.default = (version, configOptions = {}) => {
    configOptions.baseURL = config_1.default.baseUrl + '/api/' + version + '/';
    return axios_1.default.create(configOptions);
};
//# sourceMappingURL=axios.js.map