import { fileURLToPath } from "url";
import path from "path";

export function findModulePath(moduleName, url) {
  const __filename = fileURLToPath(url);
  const __dirname = path.dirname(__filename);
  // 查找在当前文件所在目录的相对路径下的文件
  const relativePath = path.join(__dirname, moduleName);
  return relativePath;
}
