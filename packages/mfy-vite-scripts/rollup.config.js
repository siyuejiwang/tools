export default {
  input: {
    "bin/index": "bin/index.js",
    "scripts/develop": "scripts/develop.js",
  },
  output: {
    dir: "dist",
    format: "es", // 输出格式，可以是cjs（CommonJS）、es（ES模块）、umd等，这里选择es格式
    chunkFileNames: "utils/[name].js"
  },
};
