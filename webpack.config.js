var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require ('path');
var CompressionPlugin = require("compression-webpack-plugin");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin')
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const smp = new SpeedMeasurePlugin();
require("babel-polyfill");

module.exports = smp.wrap({
  mode: 'production',
  optimization: {
    minimize: true
  },
  
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
            'NODE_ENV': JSON.stringify('production')
        }
    }),
    new CopyWebpackPlugin(['assets']),
    new CompressionPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.(js|html|css)$/,
      // threshold: 10240,
      minRatio: 1
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|fr|en|es/),
    // new BundleAnalyzerPlugin({openAnalyzer: true})
],

  devtool: '',
  // devtool: 'cheap-module-source-map',
});
