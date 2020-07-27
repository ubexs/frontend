const fs = require('fs-extra');
fs.copySync('./src/views', './dist/views');
fs.copySync('./src/public', './dist/public');