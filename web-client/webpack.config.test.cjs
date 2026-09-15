const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');

test('artifact selection reads .env and respects shell overrides', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'oshiya-webpack-'));
    try {
        fs.copyFileSync(path.join(__dirname, 'webpack.config.js'), path.join(directory, 'webpack.config.js'));
        fs.symlinkSync(path.resolve(__dirname, '../node_modules'), path.join(directory, 'node_modules'));
        fs.writeFileSync(path.join(directory, '.env'), 'PROTOCOL_VERSION=canary\n');
        fs.writeFileSync(path.join(directory, 'tsconfig.json'), JSON.stringify({compilerOptions: {baseUrl: '.'}}));
        const env = {...process.env};
        delete env.PROTOCOL_VERSION;
        const script = `
            const config = require('./webpack.config.js');
            const copier = config.plugins.find(plugin => plugin.constructor.name === 'CopyPlugin');
            process.stdout.write(JSON.stringify(copier.patterns.map(pattern => pattern.from)));
        `;
        for (const version of ['canary', 'production']) {
            const output = execFileSync(process.execPath, ['-e', script], {cwd: directory, env});
            assert.deepEqual(JSON.parse(output), ['circuits.wasm', 'provingKey.zkey', 'verificationKey.json'].map(file => '../sdk/src/wasm/' + version + '/' + file));
            env.PROTOCOL_VERSION = 'production';
        }
    } finally {
        fs.rmSync(directory, {recursive: true, force: true});
    }
});
