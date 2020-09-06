const common_1 = require("@tsed/common");
let called = 0;
let og = console.log;
const fs = require('fs');
const libPath = require('path');
let viewBase = libPath.join(__dirname, '../../dist/views');
const existsArr = [];
let notFound = [];
common_1.Render = (path, opts) => {
    called++;
    if (!existsArr.includes(path)) {
        let fullViewFilePath = libPath.join(viewBase, path + '.vash');
        let alreadyExists = fs.existsSync(fullViewFilePath);
        if (!alreadyExists) {
            notFound.push({
                small: path,
                full: fullViewFilePath
            });
        } else {
            existsArr.push(path);
        }
    }
    return (one, two, three) => {

    }
}
console.log = () => {
    return;
}
console.warn = () => {
    return;
}
console.error = () => {
    return;
}
require('../../dist/index');
setTimeout(() => {
    og.apply(null, ['[info] missing:', notFound]);
    process.exit();
}, 1500);