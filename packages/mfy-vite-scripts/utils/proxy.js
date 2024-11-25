import paths from "path";
import fs from "fs";
import { getArgs } from "./args.js";
const resolveApp = (relativePath) => paths.resolve(process.cwd(), relativePath);
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
export async function getProxySetting() {
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
