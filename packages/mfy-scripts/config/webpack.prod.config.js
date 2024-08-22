const path = require("path");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const paths = require("./paths");
const { getArgs, hasArg } = require("@gw/gw-helpers/dev");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");

process.env.NODE_ENV = "production";
process.env.BABEL_ENV = "production";

const args = getArgs();

function getConfig(env) {
  return merge(baseConfig(env), {
    bail: true,
    entry: paths.appIndexJs,
    output: {
      path: paths.appBuild,
      filename: "static/js/[name].[chunkhash:8].js",
      chunkFilename: "static/js/[name].[chunkhash:8].chunk.js",
      clean: true,
      asyncChunks: true,
      chunkLoadingGlobal: `webpackJsonp_${paths.appName}`,
      publicPath: "auto",
      library: {
        name: paths.appName,
        type: "umd",
      },
      devtoolModuleFilenameTemplate: (info) =>
        path
          .resolve(paths.appSrc, info.absoluteResourcePath)
          .replace(/\\/g, "/"),
    },
    plugins: [
      new ModuleFederationPlugin({
        ...paths.federationConfig,
        shared: []
      }),
      new webpack.DefinePlugin({
        ENV: JSON.stringify(env),
        MOCK: hasArg(args.mock),
        /**
         * 指定案例名称，默认为goodwe公司
         */
        CASE: JSON.stringify(args.case || "goodwe"),
        APPCODE: JSON.stringify(args.appcode || ""),
      }),
      new HtmlWebpackPlugin({
        inject: true,
        filename: "index.html",
        template: "public/index.html",
        templateParameters: {
          configPrefix: paths.cdnDomain[env],
          odmCase: args.case || "goodwe",
        },
      }),
      new ProgressBarPlugin(),
      new MiniCssExtractPlugin({
        filename: "static/css/[name].[contenthash:8].css",
        chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
      }),
      new WebpackManifestPlugin({
        fileName: "asset-manifest.json",
      }),
    ],
    node: {},
  });
}

module.exports = getConfig;
