"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_httpexceptions_1 = require("ts-httpexceptions");
class HTTPErrorsBase {
    constructor() {
        this.BadRequest = ts_httpexceptions_1.BadRequest;
        this.NotFound = ts_httpexceptions_1.NotFound;
        this.Conflict = ts_httpexceptions_1.Conflict;
        this.InternalServerError = ts_httpexceptions_1.InternalServerError;
        this.Unauthorized = ts_httpexceptions_1.Unauthorized;
    }
}
exports.default = HTTPErrorsBase;
//# sourceMappingURL=errors.js.map