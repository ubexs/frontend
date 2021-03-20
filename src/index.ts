import { $log } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { Server } from "./Server";

async function bootstrap() {
    try {
        $log.debug("Start server...");
        const platform = await PlatformExpress.bootstrap(Server, {
            // extra settings
            mergeParams: true
        });

        await platform.listen();
        $log.debug("Server initialized");
    } catch (er) {
        $log.error(er);
    }
}

bootstrap();
