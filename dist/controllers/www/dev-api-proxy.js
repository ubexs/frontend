"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../base");
const common_1 = require("@tsed/common");
const axios_1 = require("../../helpers/axios");
let DevApiProxy = class DevApiProxy extends base_1.default {
    async allMethods(req, res) {
        if (process.env.NODE_ENV !== 'development') {
            throw new Error('Disabled');
        }
        const result = await axios_1.default('v1', {
            validateStatus: () => {
                return true;
            },
            headers: {
                cookie: req.headers['cookie'],
                'x-csrf-token': req.headers['x-csrf-token'] || 'null',
                'accept': req.headers['accept'] || 'application/json',
            },
            maxRedirects: 0,
            responseType: 'arraybuffer',
        }).request({
            method: req.method,
            url: req.url,
            data: req.body,
        });
        const headers = {};
        for (const key of Object.getOwnPropertyNames(result.headers)) {
            if (key === 'host') {
                continue;
            }
            let val = result.headers[key];
            if (!val || !key) {
                continue;
            }
            headers[key] = val;
        }
        if (result.headers['content-type'].match(/json/g)) {
            res.set(headers);
            res.status(result.status);
            res.send(result.data).end();
            return;
        }
        res.writeHead(result.status, result.statusText, headers);
        res.write(result.data, err => {
            if (err) {
                console.error(err);
            }
            res.end();
        });
    }
};
__decorate([
    common_1.All('/*'),
    __param(0, common_1.Req()),
    __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DevApiProxy.prototype, "allMethods", null);
DevApiProxy = __decorate([
    common_1.Controller('/api/v1/')
], DevApiProxy);
exports.DevApiProxy = DevApiProxy;
