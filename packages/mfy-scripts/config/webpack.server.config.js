"use strict";

const path = require("path");
const config = require("./webpack.dev.config");
const paths = require("./paths");

const host = process.env.HOST || "0.0.0.0";
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

module.exports = function (proxy, allowedHost) {
  return {
    static: {
      directory: paths.appPublic,
      publicPath: config.output.publicPath,
    },
    compress: true,
    hot: true,
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
    },
    host: host,
    port: DEFAULT_PORT,
    client: {
      overlay: false, // 编译出现错误时，将错误直接显示在页面上
    },
    historyApiFallback: {
      disableDotRule: true,
    },
    // public: allowedHost,
    proxy,
  };
};
