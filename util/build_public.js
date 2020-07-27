const fs = require('fs');
const babelrc = JSON.parse(fs.readFileSync('./.babelrc').toString());

let bundleDir = './src/public/js/bundle';
let distBundleDir = './dist/public/js/bundle';
let bundleConfigDir = bundleDir + '/config';

let bundleFiles = fs.readdirSync(bundleConfigDir);
/**
 * @type {string[]}
 */
const filesToBundle = [];
for (const file of bundleFiles) {
    if (file.slice(file.length - '.bundle.js'.length) !== '.bundle.js') {
        filesToBundle.push(file.slice(0, file.length - '.js'.length));
    }
}

const {DynamicPool} = require("node-worker-threads-pool");
const pool = new DynamicPool(8);

console.log('bundle these guys', filesToBundle);
const handleBundle = (workerData) => {
    return new Promise((res, rej) => {
        let data = this.workerData || workerData;
        let bundleConfigDir = data.bundleConfigDir;
        let bundle = data.bundle;
        let distBundleDir = data.distBundleDir;
        let bundleDir = data.bundleDir;
        let babelrc = data.babelrc;

        const crypto = require('crypto');
        const browserify = require("browserify");
        const fs = require('fs');
        const minify = require("babel-minify");

        let bundleDetailsPath = bundleConfigDir + '/' + bundle + '.js';
        let finalizedPath = bundleDir + '/' + bundle + '.bundle.js';
        let distPath = distBundleDir + '/' + bundle + '.bundle.js';
        browserify(bundleDetailsPath)
            .transform("babelify", babelrc)
            .bundle()
            .pipe(fs.createWriteStream(finalizedPath))
            .on('close', d => {
                console.log(bundle, 'created. minifying it...');

                const {code} = minify(fs.readFileSync(finalizedPath).toString(), {
                    booleans: true,
                    builtIns: true,
                    consecutiveAdds: true,
                    deadcode: false, // setting to true causes extreme slowdown/crashing (in the browser)
                    evaluate: false, // setting to true causes transpile issues
                    flipComparisons: true,
                    guards: true,
                    infinity: true,
                    mangle: true,
                    memberExpressions: true,
                    mergeVars: true,
                    numericLiterals: true,
                    propertyLiterals: true,
                    regexpConstructors: true,
                    removeUndefined: true,
                    replace: true,
                    simplify: false, // setting to true causes transpile issues
                    simplifyComparisons: true,
                    typeConstructors: true,
                    undefinedToVoid: true,
                })
                /*
               babelrc['presets'].forEach((val, index, arr) => {
                   if (val[0] === 'minify') {
                       arr[index][1]['simplify'] = false;
                       arr[index][1]['evaluate'] = false;
                   }
               });
               babelrc['presets'] = babelrc['presets'].filter((val) => {
                   if (val[0] !== '@babel/preset-env') {
                       return true;
                   }
                   return false;
               })
               // this is added by browserify i think
               delete babelrc['_flags'];
               // since no file name is specified, "ignore" breaks babel.transform()
               delete babelrc['ignore'];
               console.log(babelrc);
               // transpile...
               const {code} = babel.transformSync(fs.readFileSync(bundleStart).toString(), babelrc);

                 */
                let byteLength = Buffer.byteLength(code, 'utf8');
                let sizeInMb = byteLength / 1e+6;
                const hash = crypto.createHash('sha256').update(code).digest('hex');
                const finalizedCode = '// ' + bundle + '\n' + '// ' + hash + '\n// ' + new Date().toISOString() + '\n// ' + sizeInMb + ' MB\n' + code;
                // the transpiled code is written and then copied so that it is available in dev and prod envs
                fs.writeFileSync(finalizedPath, finalizedCode);
                fs.copyFileSync(finalizedPath, distPath);
                console.log(bundle, 'finished.');
                res(bundle);
            })
    })
}
console.time('multi_thread');

let proms = [];
for (const bundle of filesToBundle) {
    let data = {
        // some data
        bundle: bundle,
        bundleConfigDir: bundleConfigDir,
        bundleDir: bundleDir,
        distBundleDir: distBundleDir,
        babelrc: babelrc,
    };
    // proms.push(handleBundle(data))

    proms.push(pool.exec({
        task: handleBundle,
        workerData: data,
    }));
}
Promise.all(proms).then(d => {
    console.log(proms);
    console.log('Done');
    console.timeEnd('multi_thread');
    process.exit();
})
