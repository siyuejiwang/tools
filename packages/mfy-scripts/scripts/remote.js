const { execSync } = require("child_process");
const path = require("path");
const paths = require("../config/paths");
const ncp = require("ncp").ncp;

// 获取传递给脚本的参数
const args = process.argv[process.argv.length - 1];

// 构建 lib-umd 命令
const libUmdCommand = `node ${__dirname}/lib-umd.js --entry ./src/remote --inlineCss --remote --env ${args}`;

// 执行 lib-umd 命令
try {
  execSync(libUmdCommand, { stdio: "inherit" });
  // 完成 lib-umd 后拷贝 umd 文件夹下的内容到 build/remote
  const sourceDir = paths.appPackagesBuildUMD;
  const destinationDir = paths.appPackagesBuildRemote;

  ncp(sourceDir, destinationDir, function (err) {
    if (err) {
      console.error("Error copying files:", err);
      process.exit(1);
    } else {
      console.log("Files copied successfully!");
    }
  });
} catch (error) {
  console.error("Error during build:", error);
  process.exit(1);
}
