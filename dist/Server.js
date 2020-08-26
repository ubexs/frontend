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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@tsed/common");
const platform_express_1 = require("@tsed/platform-express");
const bodyParser = require("body-parser");
const compress = require("compression");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const express = require("express");
const path = require("path");
require("@tsed/swagger");
const cons = require("consolidate");
const morgan = require("morgan");
const config_1 = require("./helpers/config");
const Any_1 = require("./middleware/Any");
const ErrorHandle_1 = require("./middleware/ErrorHandle");
const rootDir = __dirname;
let portToListenOn = config_1.default.port || process.env.PORT || 3000;
console.log('[info] listening on port', portToListenOn);
let Server = class Server {
    $beforeRoutesInit() {
        this.app.raw.set("views", this.settings.get("viewsDir"));
        this.app.raw.set('view engine', 'vash');
        this.app.raw.engine("vash", cons.vash);
        this.app.raw.set('mergeParams', true);
        this.app
            .use(platform_express_1.GlobalAcceptMimesMiddleware)
            .use(methodOverride())
            .use(compress({}));
        if (process.env.NODE_ENV === 'development') {
            this.app
                .use(express.static(path.join(__dirname, './public/')));
        }
        this.app
            .use(cookieParser())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
            extended: true
        }))
            .use(Any_1.default);
        if (process.env.NODE_ENV === 'development') {
        }
        else {
            this.app.use(morgan('tiny'));
        }
    }
    $afterRoutesInit() {
        this.app.use(ErrorHandle_1.NotFoundMiddleware);
    }
};
__decorate([
    common_1.Inject(),
    __metadata("design:type", common_1.PlatformApplication)
], Server.prototype, "app", void 0);
__decorate([
    common_1.Configuration(),
    __metadata("design:type", Object)
], Server.prototype, "settings", void 0);
Server = __decorate([
    common_1.Configuration({
        rootDir,
        mount: {
            "/": [
                `${rootDir}/controllers/www/**/*.ts`
            ],
        },
        viewsDir: `${rootDir}/views`,
        acceptMimes: ["application/json"],
        port: portToListenOn,
        logger: {
            logEnd: false,
            logRequest: false,
            logStart: false,
        },
        componentsScan: [
            `${rootDir}/middleware/*.ts`
        ],
        validationModelStrict: false,
        httpsPort: false,
    })
], Server);
exports.Server = Server;
