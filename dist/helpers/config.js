"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const json5 = require("json5");
const dir = __dirname;
const path = require("path");
let confPath = path.join(dir, '../../config.json');
console.log(confPath);
const config = json5.parse(fs.readFileSync(confPath).toString());
if (typeof config.env === 'string') {
    config.env = config.env.toLowerCase();
}
if (config.env === 'production' || config.env === 'development' || config.env === 'test') {
    process.env.NODE_ENV = config.env.toLowerCase();
}
console.log('NODE_ENV', process.env.NODE_ENV);
exports.default = config;
//# sourceMappingURL=config.js.map