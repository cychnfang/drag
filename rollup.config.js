// import path from 'path';
// import alias  from '@rollup/plugin-alias';
// import resolve from "@rollup/plugin-node-resolve";
// import typescript from 'rollup-plugin-typescript2';
// import myExample from './myPlugins.js'

const path = require('path');
const alias = require('@rollup/plugin-alias');
const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');


module.exports = {
    input: path.resolve(__dirname, 'packages/core/src/index.ts'),
    output: {
        file: 'dist/bundle.js',
        format: 'es'
    },
    plugins: [
        alias(), 
        resolve(),
        typescript({
            tsconfig: path.resolve(__dirname, 'tsconfig.json')
        })
    ],
}