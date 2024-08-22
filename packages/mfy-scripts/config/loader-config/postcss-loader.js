const postcssConfig = require("@gw/css/postcss.config");
module.exports = () => {
  return {
    loader: require.resolve("postcss-loader"),
    options: {
      postcssOptions: {
        plugins: postcssConfig.plugins,
        config: false,
      },
    },
  };
};
