import { Command } from "commander";
import fs from "fs";
import { findModulePath } from "../../utils/findPath.js";

class BaseCommand extends Command {
  constructor(name) {
    super(name);
    const data = fs.readFileSync(
      findModulePath("../../package.json", import.meta.url),
      "utf-8"
    );
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

export default BaseCommand;
