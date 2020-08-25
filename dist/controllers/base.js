"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../helpers/errors");
const Users_1 = require("../services/Users");
const Groups_1 = require("../services/Groups");
const Forums_1 = require("../services/Forums");
const Catalog_1 = require("../services/Catalog");
const User_Referral_1 = require("../services/User-Referral");
const Games_1 = require("../services/Games");
const Support_1 = require("../services/Support");
const Staff_1 = require("../services/Staff");
const xss = require("xss");
const moment = require("moment");
const ts_httpexceptions_1 = require("ts-httpexceptions");
class ControllerBase extends errors_1.default {
    constructor(data) {
        super();
        this.base = ControllerBase;
        this.xss = xss;
        this.moment = moment;
        this.Users = new Users_1.default(data);
        this.Groups = new Groups_1.default(data);
        this.Forums = new Forums_1.default(data);
        this.Catalog = new Catalog_1.default(data);
        this.UserReferral = new User_Referral_1.default(data);
        this.Games = new Games_1.default(data);
        this.Support = new Support_1.default(data);
        this.Staff = new Staff_1.default(data);
    }
    static ValidateId(id) {
        console.log('provided', id);
        if (typeof id === 'object' && id !== 'null') {
            let idStr = Object.getOwnPropertyNames(id).map(key => {
                return id[key];
            }).join('');
            id = parseInt(idStr, 10);
        }
        else if (typeof id === 'string') {
            id = parseInt(id, 10);
        }
        if (!Number.isInteger(id)) {
            throw new ts_httpexceptions_1.BadRequest('InvalidId');
        }
        return id;
    }
}
exports.default = ControllerBase;
//# sourceMappingURL=base.js.map