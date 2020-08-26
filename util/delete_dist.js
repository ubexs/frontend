var rimraf = require("rimraf");
rimraf.sync("./dist/");
const fs = require('fs-extra');
fs.mkdirSync('./dist/');
