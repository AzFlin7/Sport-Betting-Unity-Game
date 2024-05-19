var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require ('path');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
require("babel-polyfill");

module.exports = smp.wrap({
  mode: 'development',

  optimization: {
    minimize: false
  },
  devtool: 'cheap-module-eval-source-map',

  entry: ['babel-polyfill', 'isomorphic-fetch', './tools/canvas-toBlob', './src/client'],
  
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
        include: [path.resolve(__dirname, 'assets/images')],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      { test: /\.js$/, 
        exclude: /node_modules/, 
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        },
      }
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('development')
        }
    }),
    new CopyWebpackPlugin(['assets'])
],

});