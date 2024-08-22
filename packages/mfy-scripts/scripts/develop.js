/**
 * gw-scripts develop
 */

const {
  choosePort,
  createCompiler,
  prepareUrls,
  prepareProxy,
  getArgs,
} = require("@gw/gw-helpers/dev");
const webpack = require("webpack");
const fs = require("fs");
const WebpackDevServer = require("webpack-dev-server");
const paths = require("../config/paths");
const config = require("../config/webpack.dev.config");
const createDevServerConfig = require("../config/webpack.server.config");
/** command instruction */
require("../bin/commanders/dev").getOptions();

const args = getArgs();

process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";

process.on("unhandledRejection", (err) => {
  throw err;
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

choosePort(HOST, DEFAULT_PORT)
  .then((port) => {
    if (!port) return;

    const protocol = process.env.HTTPS === "true" ? "https" : "http";
    const urls = prepareUrls(protocol, HOST, port);
    //从proxy.json 中取出配置与package.json 的 proxy 进行合并
    const envProxySetting = require(paths.appPackageJson).proxy;
    const localProxySetting = fs.existsSync(paths.appProxyJson)
      ? require(paths.appProxyJson)
      : {};
    //proxy.json中的配置没有指定ignoreEnv时默认忽略环境
    Object.keys(localProxySetting).forEach((o) => {
      if (!Object.keys(o).includes("ignoreEnv")) {
        localProxySetting[o].ignoreEnv = true;
      }
    });
    const proxySetting = { ...envProxySetting, ...localProxySetting };

    const proxyConfig = prepareProxy(
      proxySetting,
      paths.appPublic,
      args.env || "dev"
    );

    const compiler = createCompiler(webpack, config);

    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.localUrlForBrowser
    );

    const devServer = new WebpackDevServer(serverConfig, compiler);
    devServer.startCallback(() => {
      console.log(`Successfully started server on http://localhost:${DEFAULT_PORT}`);
    });
  })
  .catch((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(1);
  });
