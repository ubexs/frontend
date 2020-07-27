"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../helpers/errors");
const Users_1 = require("../services/Users");
class ControllerBase extends errors_1.default {
    constructor(data) {
        super();
        this.Users = new Users_1.default(data);
    }
}
exports.default = ControllerBase;
//# sourceMappingURL=base.js.map