const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseDevConfig = () => ({
  devtool: 'eval-cheap-module-source-map',
  entry: {
    app: [path.join(__dirname, '../src/app')],
  },
  output: {
    path: path.join(__dirname, '../dev/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
  },
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules', 'src'],
    alias: {
      PIXI: 'pixi.js',
    },
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }],
  },
  plugins: [
    new webpack.ProvidePlugin({
      PIXI: 'pixi.js',
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, '../src/index.html'),
    }),
  ],
});

module.exports = baseDevConfig();
