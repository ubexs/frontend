"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const config_1 = require("./config");
const client = axios_1.default.create({
    baseURL: config_1.default.baseUrl.backend,
});
exports.default = (version, configOptions = {}) => {
    configOptions.baseURL = config_1.default.baseUrl.backend + '/api/' + version + '/';
    configOptions.headers = configOptions.headers || {};
    configOptions.headers['server-authorization'] = config_1.default.backendAuthorization;
    return axios_1.default.create(configOptions);
};
