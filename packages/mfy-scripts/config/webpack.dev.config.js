const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;
const paths = require("./paths");
const { getArgs, hasArg } = require("@gw/gw-helpers/dev");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const chalk = require("chalk");
const green = chalk.hex("#97c179");

process.env.NODE_ENV = "development";
const args = getArgs();

class TimestampPlugin {
  apply(compiler) {
    compiler.hooks.done.tap("TimestampPlugin", () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // JavaScript 中的月份从 0 开始
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      console.log(
        green(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`)
      );
    });
  }
}

const config = merge(baseConfig("dev"), {
  entry: paths.appIndexJs,
  output: {
    filename: `${paths.appName}/bundle.js`,
    path: paths.appPublic,
    publicPath: "auto",
    chunkLoadingGlobal: `webpackJsonp_${paths.appName}`,
    library: {
      name: paths.appName,
      type: 'umd',
    },
  },
  /**
   * {@link https://v4.webpack.js.org/configuration/externals/ webpack4-external}
   * @type {string|object|function|regex}
   * 采用和webpack.base.config中不一致数据类型，以便merge清空base中配置
   * 开发阶段 独立启动 微前端子应用时，需设为base config里的externals,以便使用基座里引用的UMD的公共库
   * 开发阶段 独立启动 普通应用时，需设为[],以便使用本地ESM的公共库,出错提示更友好
   */
  externals: args.micro ? undefined : [],
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new ModuleFederationPlugin({ ...paths.federationConfig }),
    new webpack.DefinePlugin({
      ENV: JSON.stringify(args.env || "dev"),
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
      template: args.htmlTemplate || "public/index.html",
      templateParameters: {
        configPrefix: paths.cdnDomain[args.env],
        odmCase: args.case || "goodwe",
      },
    }),
    args.fastRefresh && new ReactRefreshWebpackPlugin({ overlay: false }),
    new ProgressBarPlugin(),
    new TimestampPlugin(),
  ].filter(Boolean),
  node: {},
});

module.exports = config;
