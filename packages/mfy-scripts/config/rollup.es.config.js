const paths = require("./paths");
const rollupTypescript = require("rollup-plugin-typescript2");
const postcss = require("rollup-plugin-postcss");
const config = {
  input: paths.appLibIndexJs,
  output: {
    file: `${paths.appPackagesBuildES}/index.js`,
    format: "es",
  },
  external: [
    "react",
    "react-dom",
    "react-router-dom",
    "antd",
    "moment",
    "mqtt",
    "axios",
    "@gw/gw-request",
    //todo 2.0时移除@gw/gw-config-center
    "@gw/gw-config-center",
    "@gw/web-basic-components",
    "@gw/web-business-components",
    "@gw/hooks",
    // "@gw/gw-utils",
    // "uuid",
  ],
  plugins: [
    rollupTypescript({
      tsconfigOverride: {
        include: ["packages/**/*"],
        exclude: ["demos/**/*"],
      }, // deep merge => objects are merged, arrays are concatenated, primitives are replaced, etc
      // verbosity: 3, // 0 -- Error 1 -- Warning 2 -- Info 3 -- Debug
      useTsconfigDeclarationDir: true,
      clean: true,
    }),
    postcss({
      extract: true,
    }),
  ],
};
module.exports = config;
