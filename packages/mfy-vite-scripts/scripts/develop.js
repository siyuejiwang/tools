import { createServer } from "vite";
import { getViteConfig } from "../config/vite.dev.config.js";
import chalk from "chalk";
import devCommand from "../bin/commanders/dev.js";

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
          chalk.red(`Something is already running on port ${originPort}`),
          chalk.green(`\nServer now running at ${host}:${port}`)
        );
      } else {
        console.log(
          chalk.green(`Server running at ${host}:${port}`)
        );
      }
    });
  } catch (error) {
    console.error(chalk.red("Error during server:", error));
  }
}

main();
