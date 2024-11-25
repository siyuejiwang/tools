const path = require("path");
const glob = require("glob");
const WebpackMerge = require("webpack-merge");
const paths = require("./paths");
const getWebpackUmdConfig = require("./webpack.umd.config");

const lessFiles = glob.sync(path.resolve(paths.appPackages, "**/*.{less,css}"));

module.exports = (env) => {
  return WebpackMerge(getWebpackUmdConfig(env), {
    entry: [...lessFiles, paths.appPackages],
    resolve: {
      alias: {
        "@": paths.appPackages,
      },
    },
  });
};