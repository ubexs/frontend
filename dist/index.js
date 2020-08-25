"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@tsed/common");
const platform_express_1 = require("@tsed/platform-express");
const Server_1 = require("./Server");
async function bootstrap() {
    try {
        common_1.$log.debug("Start server...");
        const platform = await platform_express_1.PlatformExpress.bootstrap(Server_1.Server, {
            mergeParams: true
        });
        await platform.listen();
        common_1.$log.debug("Server initialized");
    }
    catch (er) {
        common_1.$log.error(er);
    }
}
bootstrap();
//# sourceMappingURL=index.js.map