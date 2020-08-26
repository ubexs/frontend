"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const json5 = require("json5");
const path = require("path");
const assert_1 = require("assert");
let confPath = path.join(__dirname, '../../config.json');
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
assert_1.strictEqual(typeof config.backendAuthorization, 'string');
assert_1.strictEqual(typeof config.baseUrl, 'object');
assert_1.strictEqual(typeof config.baseUrl.frontend, 'string');
assert_1.strictEqual(typeof config.baseUrl.backend, 'string');
assert_1.strictEqual(typeof config.baseUrl.play, 'string');
assert_1.strictEqual(typeof config.backendAuthorization, 'string');
assert_1.strictEqual(typeof config.recaptcha, 'object');
assert_1.strictEqual(typeof config.recaptcha.v2, 'object');
assert_1.strictEqual(typeof config.recaptcha.v3, 'object');
assert_1.strictEqual(typeof config.recaptcha.v2.public, 'string');
assert_1.strictEqual(typeof config.recaptcha.v3.public, 'string');
