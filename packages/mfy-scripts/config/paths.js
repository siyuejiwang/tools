const paths = require("path");
const fs = require("fs");

const getEntryName = (entryPath) => {
  const start = entryPath.lastIndexOf("/");
  const entryNameLen = entryPath.length - start;
  return entryPath.slice(start + 1, start + entryNameLen);
};

const getEntry = (relativePath) => {
  console.log("relativePath", relativePath);
  const absolutePath = paths.resolve(process.cwd(), relativePath);
  console.log("absolutePath", absolutePath);
  const stat = fs.lstatSync(absolutePath);
  if (stat.isDirectory()) {
    const items = fs.readdirSync(absolutePath);
    const entryObj = items.reduce((obj, pa, idx) => {
      const curPath = paths.join(absolutePath, pa);
      console.log("curPath", curPath);
      const entryName = getEntryName(curPath);
      obj[entryName] = paths.join(curPath, "index.ts");
      return obj;
    }, {});
    console.log("entryObj", entryObj);
    return entryObj;
  } else {
    console.log("absolutePath", absolutePath);
    return absolutePath;
  }
};

const resolveApp = (relativePath) => paths.resolve(process.cwd(), relativePath);

const pkg = require(resolveApp("package.json"));
const { getArgs } = require("@gw/gw-helpers/dev");

const assetsPath = pkg.assetsPath ? pkg.assetsPath : "";
const buildPath = "build/" + assetsPath;
const args = getArgs();

module.exports = {
  dotenv: resolveApp(".env"),
  appPath: resolveApp("."),
  /** app packages 文件夹 */
  appPackages: resolveApp(args.appPackages || "packages"),
  appBuild: resolveApp(buildPath),
  appDist: resolveApp("dist"),
  /** app packages 打包文件夹，和一般项目build区别，打包生成dist/umd */
  appPackagesBuildUMD: resolveApp("umd"),
  /** app packages 打包文件夹，和一般项目build区别，直接在项目根目录下生成umd */
  /** app packages 打包文件夹，和一般项目build区别，打包生成dist/es */
  appPackagesBuildES: resolveApp("es"),
  /** app packages 打包文件夹，和一般项目build区别，打包生成dist/esm */
  appPackagesBuildESM: resolveApp("esm"),
  /** app packages 打包文件夹，和一般项目build区别，打包生成dist/lib */
  appPackagesBuildLib: resolveApp("lib"),
  /** app pages remote 打包生成build/remote */
  appPackagesBuildRemote: resolveApp(buildPath + "/remote"),
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appPackageJson: resolveApp("package.json"),
  appProxyJson: resolveApp("proxy.json"),
  appSrc: resolveApp("src"),
  appNodeModules: resolveApp("node_modules"),
  appName: pkg.name,
  libraryName: pkg.libraryName || pkg.name,
  appVersion: pkg.version,
  appModuleEntry: pkg.module,
  federationConfig: (() => {
    pkg.federationConfig.exposes && Object.keys(pkg.federationConfig.exposes).forEach((key) => {
      pkg.federationConfig.exposes[key] = resolveApp(pkg.federationConfig.exposes[key]);
    });
    return pkg.federationConfig;
  })(),
  assetsPath: assetsPath,
  appIndexJs: fs.existsSync("src/index.tsx")
    ? resolveApp("src/index.tsx")
    : fs.existsSync("src/index.jsx")
    ? resolveApp("src/index.jsx")
    : resolveApp("src/index.js"),
  appLibIndexJs: args.entry
    ? getEntry(args.entry)
    : fs.existsSync("src/index.ts")
    ? resolveApp("src/index.ts")
    : resolveApp("src/index.js"),
  /** 模块入口设置文件 */
  appLibEntryJs: resolveApp("./index.js"),
  /** typescript 配置文件 */
  tsConfig: resolveApp("tsconfig.json"),
  cdnDomain: {
    beta: "//static-beta.we.goodwe.com",
    prod: "//static01.we.goodwe.com",
    "prod-de": "//static-prod-eu.we.goodwe.com",
  },
};
