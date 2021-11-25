const path = require('path');
const webpack = require('webpack');
const PrettierPlugin = require("prettier-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: "production",
  devtool: 'source-map',
  entry: './src/SDK.ts',
  output: {
    filename: 'SDK.js',
    path: path.resolve(__dirname, 'dist'),
    library: "SDK",
    libraryTarget: 'umd'
  },
  devServer: {
    static: ["dist", "demo"],
    compress: true,
    port: 9000,
    client: {
      progress: true,
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({ extractComments: false })
    ],
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
    new PrettierPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
};