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
const Sentry = require("../helpers/sentry");
const common_1 = require("@tsed/common");
const xss = require("xss");
const logError = (status, code, path, method) => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    return console.log('[' + method.toUpperCase() + '] ' + path + ' [' + status.toString() + '] - ' + code);
};
const ErrorTemplate = (title, body) => {
    return `<!DOCTYPE html><html><head><title>${title}</title><body><p>${body}</p></body></html>`;
};
let GlobalErrorHandler = class GlobalErrorHandler extends common_1.GlobalErrorHandlerMiddleware {
    use(error, request, response) {
        if (error && error.message) {
            if (error.message === 'LogoutRequired') {
                logError(302, 'LogoutRequired', request.originalUrl, request.method);
                return response.redirect('/dashboard');
            }
            else if (error.message === 'LoginRequired') {
                logError(302, 'LoginRequired', request.originalUrl, request.method);
                return response.redirect('/login');
            }
        }
        if (process.env.NODE_ENV === 'development' && request.accepts('html')) {
            return response.send(`<h1>HTTP ${error.status || 500} - ${error.name || 'Internal Server Error'}</h1><p style="white-space: pre-wrap;font-family:monospace;">${xss.filterXSS(error.stack, { whiteList: {} })}</p>\n\n<!-- Original Error Message\n${error.message}\n-->`).end();
        }
        if (error.isAxiosError && error.response) {
            if (error.response.status === 404) {
                error.name = 'NOT_FOUND';
            }
            else if (error.response.status === 400) {
                error.name = 'BAD_REQUEST';
            }
            else if (error.response.status === 409) {
                error.name = 'CONFLICT';
            }
            else if (error.response.status === 401) {
                error.name = 'UNAUTHORIZED';
            }
            else if (error.response.status === 403) {
                error.name = 'FORBIDDEN';
            }
        }
        try {
            if (error.name === 'BAD_REQUEST') {
                return response.status(400).send(ErrorTemplate('400: Bad Request', 'You or your browser sent an invalid request.')).end();
            }
            else if (error.name === 'NOT_FOUND') {
                logError(404, 'NOT_FOUND', request.originalUrl, request.method);
                return response.status(404).send(ErrorTemplate('404: Not Found', 'The page you tried to view does not seem to exist.')).end();
            }
            else if (error.name === 'CONFLICT') {
                logError(409, error.code, request.originalUrl, request.method);
                return response.status(409).send(ErrorTemplate('409: Conflict', 'Resource conflict. Please go back and try again.')).end();
            }
            else if (error.name === 'UNAUTHORIZED') {
                return response.status(401).send(ErrorTemplate('401: Unauthorized', 'Unauthorized. Please go back and try again.')).end();
            }
            else if (error.name === 'FORBIDDEN') {
                return response.status(401).send(ErrorTemplate('403: Forbidden', 'Forbidden. Please go back and try again.')).end();
            }
            else {
                throw error;
            }
        }
        catch (e) {
            if (Sentry.isEnabled()) {
                Sentry.Sentry.captureException(e);
            }
        }
        return super.use(error, request, response);
    }
};
__decorate([
    __param(0, common_1.Err()),
    __param(1, common_1.Req()),
    __param(2, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], GlobalErrorHandler.prototype, "use", null);
GlobalErrorHandler = __decorate([
    common_1.OverrideProvider(common_1.GlobalErrorHandlerMiddleware)
], GlobalErrorHandler);
exports.GlobalErrorHandler = GlobalErrorHandler;
let NotFoundMiddleware = class NotFoundMiddleware {
    use(request, response, next) {
        response.status(404);
        if (process.env.NODE_ENV === 'development') {
            return response.send(`<h1>HTTP 404 - Not Found</h1><p>A controller or static file could not be found for <code>${request.url}</code></p>`).end();
        }
        return response.send(ErrorTemplate('404: Not Found', 'The resource you tried to view could not be found.')).end();
    }
};
__decorate([
    __param(0, common_1.Req()), __param(1, common_1.Res()), __param(2, common_1.Next()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], NotFoundMiddleware.prototype, "use", null);
NotFoundMiddleware = __decorate([
    common_1.Middleware()
], NotFoundMiddleware);
exports.NotFoundMiddleware = NotFoundMiddleware;
//# sourceMappingURL=ErrorHandle.js.map