const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    require.resolve('./polyfills'),
    path.join(__dirname, '../src/app'),
  ],
  output: {
    path: path.join(__dirname, '../build'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
  },
  plugins: [
    new webpack.ProvidePlugin({
      PIXI: 'pixi.js',
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true, // React doesn't support IE8
        warnings: false,
      },
      mangle: {
        screw_ie8: true,
      },
      output: {
        comments: false,
        screw_ie8: true,
      },
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, '../src/index.html'),
    }),
  ],
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules', 'src'],
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
      exclude: /node_modules/,
    }],
  },
};
