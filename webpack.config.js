const path = require('path');
const webpack = require('webpack');
const PrettierPlugin = require("prettier-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');


module.exports = {
    mode: "production",
    //target: "node",
    devtool: 'source-map',
    entry: ["regenerator-runtime/runtime.js", './src/index.ts'],
    output: {
        filename: 'SDK.js',
        path: path.resolve(__dirname, 'dist'),
        library: "SDK",
        libraryTarget: 'umd'
    },
    devServer: {
        static: ["dist", "demo"],
        compress: true,
        port: 9001,
        client: {
            progress: true,
        },
    },
    node: {
        fs: "empty"
    },
    module: {
        rules: [
            {
                test: /\.(m|j|t)s$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new Dotenv()
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json']
    }
};
