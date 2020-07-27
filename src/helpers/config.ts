import * as fs from 'fs';
import * as json5 from 'json5';
import * as path from 'path';
import {strictEqual} from 'assert';

let confPath = path.join(__dirname,'../../config.json');
console.log(confPath);
const config = json5.parse(fs.readFileSync(confPath).toString());

interface IWebsiteConfig {
    baseUrl: {
        frontend: string;
        backend: string;
        play: string;
    }
    port?: number;
    env?: string;
    backendAuthorization: string;
}
if (typeof config.env === 'string') {
    config.env = config.env.toLowerCase();
}
if (config.env === 'production' || config.env === 'development' || config.env === 'test') {
    process.env.NODE_ENV = config.env.toLowerCase();
}
console.log('NODE_ENV',process.env.NODE_ENV);
export default config as Readonly<IWebsiteConfig>;
// runtime config check
strictEqual(typeof config.backendAuthorization, 'string');
strictEqual(typeof config.baseUrl, 'object');
strictEqual(typeof config.baseUrl.frontend, 'string');
strictEqual(typeof config.baseUrl.backend, 'string');
strictEqual(typeof config.baseUrl.play, 'string');
strictEqual(typeof config.backendAuthorization, 'string');
