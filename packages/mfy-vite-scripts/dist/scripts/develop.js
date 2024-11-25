import { transformWithEsbuild, defineConfig, createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { createFilter } from '@rollup/pluginutils';
import fs from 'fs';
import { viteExternalsPlugin } from 'vite-plugin-externals';
import { createHtmlPlugin } from 'vite-plugin-html';
import ArgsParser from 'yargs-parser';
import path from 'path';
import chalk$1 from 'chalk';
import { Command } from 'commander';
import { f as findModulePath } from '../utils/findPath.js';
import 'url';

function vitePluginSvgr({ svgrOptions, esbuildOptions, include = "**/*.svg", exclude, } = {}) {
    const filter = createFilter(include, exclude);
    const postfixRE = /[?#].*$/s;
    return {
        name: "vite-plugin-svgr",
        enforce: "pre", // to override `vite:asset`'s behavior
        async load(id) {
            if (filter(id)) {
                const { transform } = await import('@svgr/core');
                const { default: jsx } = await import('@svgr/plugin-jsx');
                const filePath = id.replace(postfixRE, "");
                const svgCode = await fs.promises.readFile(filePath, "utf8");
                const base64 =
        "data:image/svg+xml;base64," + Buffer.from(svgCode).toString("base64");
                const componentCode = await transform(svgCode, svgrOptions, {
                    filePath,
                    caller: {
                        defaultPlugins: [jsx],
                    },
                });
                const res = await transformWithEsbuild(componentCode, id, {
                    loader: "jsx",
                    ...esbuildOptions,
                });
                return {
                    code: res.code + `\n export default "${base64}"`,
                    map: null,
                };
            }
        },
    };
}

function getArgs(argsOptions = {}) {
  const argsParserOption = {
    configuration: {
      // true in default, treat '-abc' as -a, -b, -c; change to false, treat as 'abc'
      "short-option-groups": false,
    },
    ...argsOptions,
  };
  return ArgsParser(process.argv, argsParserOption);
}

const resolveApp = (relativePath) => path.resolve(process.cwd(), relativePath);
const getConfigure = (target) => {
  return (proxy, options) => {
    proxy.on("proxyReq", (proxyReq) => {
      if (proxyReq.getHeader("origin")) {
        proxyReq.setHeader("origin", target);
      }
    });
  };
};
const prepareProxy = (proxy) => {
  if (!proxy) return;
  const { env = "dev" } = getArgs();

  if (typeof proxy !== "object") {
    console.log(chalk.red("proxy 必须是对象"));
    process.exit(1);
  }
  return Object.keys(proxy)
    .filter((key) => key !== "envConfig")
    .reduce((result, itemSettingKey) => {
      if (!proxy.envConfig && !proxy[itemSettingKey].hasOwnProperty("target")) {
        console.log(chalk.red("target 值必须存在"));
        process.exit(1);
      }
      /**
       * 支持存在一个和多个后台地址的情况
       */
      const envTarget =
        proxy.envConfig &&
        (proxy.envConfig[env] || proxy.envConfig[itemSettingKey][env]);

      const {
        target: contextTarget,
        context,
        ignoreEnv,
        ...rest
      } = proxy[itemSettingKey];
      //标记为ignoreEnv时优先使用
      const target = ignoreEnv ? contextTarget : envTarget;
      if (Array.isArray(context)) {
        context.forEach((contextItem) => {
          result[contextItem] = {
            target,
            ...rest,
            configure: getConfigure(target),
          };
        });
      } else {
        result[context] = {
          target,
          ...rest,
          configure: getConfigure(target),
        };
      }
      return result;
    }, {});
};
async function getProxySetting() {
  const pkgData = fs.readFileSync(resolveApp("package.json"), "utf-8");
  const packageJson = JSON.parse(pkgData);
  const { proxy: packageJsonSetting } = packageJson;
  const proxyJsonSetting = fs.existsSync(resolveApp("proxy.json"))
    ? JSON.parse(fs.readFileSync(resolveApp("proxy.json"), "utf-8"))
    : {};
  //proxy.json中的配置没有指定ignoreEnv时默认忽略环境
  Object.keys(proxyJsonSetting).forEach((o) => {
    if (!Object.keys(o).includes("ignoreEnv")) {
      proxyJsonSetting[o].ignoreEnv = true;
    }
  });
  const proxySetting = { ...packageJsonSetting, ...proxyJsonSetting };

  return prepareProxy(proxySetting);
}

const { case: gwCase = "goodwe", env = "dev", htmlTemplate = "public/dev.html" } = getArgs();
const { PORT = 3000, HOST = "127.0.0.1" } = process.env;
async function getViteConfig() {
  const proxySetting = await getProxySetting();
  return defineConfig({
    define: {
      ENV: JSON.stringify(env),
      CASE: JSON.stringify(gwCase),
      process: {
        env: process.env,
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          math: 'always',
        },
      },
    },
    plugins: [
      createHtmlPlugin({
        minify: true,
        entry: "/src/index.tsx",
        template: htmlTemplate,
        inject: {
          data: {
            configPrefix: "",
          },
        },
      }),
      viteExternalsPlugin({
        mqtt: "mqtt",
        moment: "moment",
      }),
      react(),
      // svgr options: https://react-svgr.com/docs/options/
      vitePluginSvgr({
        svgrOptions: {
          exportType: "named",
          ref: true,
          svgo: false,
          titleProp: true,
        },
      }),
    ],
    root: process.cwd(),
    mode: "development",
    publicDir: false,
    build: {
      assetsInlineLimit: 10000,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      port: PORT,
      open: true,
      proxy: proxySetting,
    },
  });
}

class BaseCommand extends Command {
  constructor(name) {
    super(name);
    const data = fs.readFileSync(findModulePath("../../package.json"), "utf-8");
    const pkg = JSON.parse(data);
    this.version(pkg.version);
    this.description(pkg.description);
  }

  /** @protected */
  init() {
    throw new Error("please override init().");
  }

  /**
   * 获取命令行参数
   */
  getOptions() {
    // 先执行parse，不然opts()返回默认值
    this.parse(process.argv);
    return this.opts();
  }

  /**
   * 定义选项参数
   */
  setOptions(options) {
    options.forEach((opt) => {
      this.option(opt.name, opt.description, opt.defaultValue);
    });
    return this;
  }
}

const options = [
  {
    name: "--html-template <file>",
    longName: "htmlTemplate",
    description: "specify the HtmlWebpackPlugin template field.",
    defaultValue: "public/index.html",
  },
  {
    name: "--mock",
    longName: "mock",
    description: "specify mock field",
    defaultValue: false,
  },
  {
    name: "--env <string>",
    longName: "env",
    description: "specify env field",
    defaultValue: "dev", // 只用于help的显示
  },
  {
    name: "--micro",
    longName: "micro",
    description: "specify micro field,determine whether started as a micro app", // 是否是以微应用的身份启动
    defaultValue: false,
  },
  {
    name: "--case",
    longName: "case",
    description:
      "specify the case which will be used as a webpack injection variable.(default: goodwe)",
    defaultValue: "goodwe",
  },
  {
    name: "--appcode",
    longName: "appcode",
    description:
      'specify the appcode which will be used as a webpack injection variable.(default:"" )',
    defaultValue: "",
  },
  {
    name: "--fast-refresh",
    longName: "fastRefresh",
    description: "specify whether HMR mode is turned on",
    defaultValue: false,
  },
];

class DevOptions {
  constructor(opts = {}) {
    this.version = opts.version;
    options.forEach((op) => (this[op.longName] = opts[op.longName]));
  }
}

class DevCommand extends BaseCommand {
  constructor(name) {
    super(name);
    this.init();
  }

  /** @private */
  init() {
    this.description("start local development server.");
    this.setOptions(options);
  }

  /**
   * 获取命令行参数
   * @return {DevOptions}
   */
  getOptions() {
    return new DevOptions(super.getOptions());
  }
}

var devCommand = new DevCommand("dev");

devCommand.getOptions();
async function main() {
  try {
    const viteDevConfig = await getViteConfig();
    const server = await createServer(viteDevConfig);
    await server.listen().then((viteDevServer) => {
      const originPort = viteDevConfig.server.port;
      const {
        config: {
          server: { host = "http://127.0.0.1", port },
        },
      } = viteDevServer;
      if (originPort !== port) {
        console.log(
          chalk$1.red(`Something is already running on port ${originPort}`),
          chalk$1.green(`\nServer now running at ${host}:${port}`)
        );
      } else {
        console.log(
          chalk$1.green(`Server running at ${host}:${port}`)
        );
      }
    });
  } catch (error) {
    console.error(chalk$1.red("Error during server:", error));
  }
}

main();
