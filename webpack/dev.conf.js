const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseDevConfig = () => ({
  devtool: 'eval-cheap-module-source-map',
  entry: [
    require.resolve('./polyfills'),
    path.join(__dirname, '../src/app'),
  ],
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
      exclude: [
        /\.html$/,
        /\.js$/,
        /\.css|\.less$/,
        /\.json$/,
        /src\/(js|svg)\/.*\.svg$/,
      ],
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'static/media/[name].[hash:8].[ext]',
      },
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [path.join(__dirname, '../src')],
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
