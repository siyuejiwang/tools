const BaseCommand = require("./base-command");
const { options } = require("./options");

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

module.exports = new DevCommand("dev");
