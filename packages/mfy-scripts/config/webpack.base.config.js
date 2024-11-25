const paths = require("./paths");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const svgrTemplate = require("./svgr-template");
const { EXTERNALS } = require("./constants");
const { getArgs } = require("@gw/gw-helpers/dev");
const { postcssLoader } = require("./loader-config");

const args = getArgs();
const enableBundleAnalyzer = args.analyzer;
const hasJsxRuntime = (() => {
  try {
    require.resolve("react/jsx-runtime");
    return true;
  } catch {}
  return false;
})();

const argvArr = process.argv[1].split("/");
const scriptName = argvArr[argvArr.length - 1]; // "lib-umd.js" or "lib-components.js"
console.log("--------scriptName--------", scriptName);

const isScript4Lib =
  scriptName.includes("umd") || scriptName.includes("components");

module.exports = (env) => {
  const imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
  );

  const prodEnv = process.env.NODE_ENV === "production";
  const ifInlineCss = args.inlineCss || !prodEnv;

  return {
    entry: paths.appIndexJs,
    /** @override */
    output: {},
    mode: process.env.NODE_ENV,
    /**
     * These options allows you to control how webpack notifies you
     * of assets and entry points t hat exceed a specific file limit.
     */
    performance: prodEnv
      ? {
          hints: "warning",
        }
      : false,
    /**
     * {@link https://v4.webpack.js.org/configuration/devtool/}
     * @type {boolean|string}
     */
    devtool: prodEnv ? "source-map" : "eval-cheap-module-source-map",
    resolve: {
      alias: {
        "@": paths.appSrc,
      },
      extensions: [
        ".tsx",
        ".ts",
        ".jsx",
        ".js",
        ".less",
        ".scss",
        ".css",
        ".json",
      ],
    },
    externals: EXTERNALS,
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          parser: {
            // require.ensure 不是标准，不允许使用
            requireEnsure: false,
          },
        },
        {
          oneOf: [
            {
              test: /\.(js|jsx|ts|tsx)$/,
              exclude: /node_modules/,
              loader: require.resolve("babel-loader"),
              options: {
                babelrc: false,
                configFile: false,
                presets: [
                  [
                    "babel-preset-react-app",
                    {
                      /**
                       * {@link https://zh-hans.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html}
                       * automatic为React 17版本引入，也会支持16.14和15.7版本
                       */
                      runtime: hasJsxRuntime ? "automatic" : "classic",
                    },
                  ],
                ],
                // webpack 未来的提案，将缓存编译的结果在： ${paths.appNodeModules}/.cache/babel-loader/
                cacheDirectory: true,
                cacheCompression: false,
                compact: false,
                plugins: [
                  args.fastRefresh &&
                    process.env.NODE_ENV !== "production" &&
                    require.resolve("react-refresh/babel"),
                ].filter(Boolean),
              },
            },
            {
              test: /\.module\.css$/,
              use: [
                ifInlineCss
                  ? require.resolve("style-loader")
                  : MiniCssExtractPlugin.loader,
                require.resolve("css-loader"),
                postcssLoader(),
              ],
            },
            {
              test: /\.css$/,
              use: [
                ifInlineCss
                  ? require.resolve("style-loader")
                  : MiniCssExtractPlugin.loader,
                require.resolve("css-loader"),
                postcssLoader(),
              ],
              sideEffects: true,
            },
            {
              test: /\.module\.less$/,
              use: [
                ifInlineCss
                  ? require.resolve("style-loader")
                  : {
                      loader: MiniCssExtractPlugin.loader,
                      options: {
                        publicPath: isScript4Lib ? "./" : "../../",
                        esModule: true,
                        defaultExport: true,
                      },
                    },
                {
                  loader: require.resolve("css-loader"),
                  options: {
                    modules: {
                      namedExport: false,
                      localIdentName: "[local]-[hash:base64:5]",
                      exportLocalsConvention: "as-is", // https://www.npmjs.com/package/css-loader
                    },
                  },
                },
                require.resolve("less-loader"),
              ],
            },
            {
              test: /\.less$/,
              use: [
                ifInlineCss
                  ? require.resolve("style-loader")
                  : {
                      loader: MiniCssExtractPlugin.loader,
                      options: {
                        publicPath: isScript4Lib ? "./" : "../../",
                        esModule: true,
                        defaultExport: true,
                      },
                    },
                require.resolve("css-loader"),
                require.resolve("less-loader"),
              ],
              sideEffects: true,
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              // loader: require.resolve("url-loader"),
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit
                }
              },
              generator: {
                filename: 'static/images/[name].[hash:8][ext]',
              },
            },
            {
              test: /\.svg$/,
              issuer: {
                and: [/\.(js|ts)x?$/],
              },
              use: [
                {
                  loader: require.resolve("@svgr/webpack"),
                  options: {
                    ref: true,
                    titleProp: true,
                    dimensions: false,
                    svgo: true,
                    template: svgrTemplate,
                  },
                },
                {
                  loader: require.resolve("file-loader"),
                  options: {
                    name: "static/[name].[hash:8].[ext]",
                  },
                },
              ],
            },
            {
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
              generator: {
                filename: 'static/[name].[hash:8][ext]',
              },
            },
          ],
        },
      ],
    },
    /** @override */
    plugins: [enableBundleAnalyzer ? new BundleAnalyzerPlugin() : () => {}],
    optimization: prodEnv
      ? {
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
              parallel: true,
              cache: true,
              sourceMap: false,
            }),
            new CssMinimizerPlugin(),
          ],
          splitChunks: {
            chunks: "all",
            name: false,
            maxInitialRequests: 6,
          },
          runtimeChunk: true,
        }
      : {},
  };
};
