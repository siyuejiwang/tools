import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function findModulePath(moduleName) {
  // 查找在当前文件所在目录的相对路径下的文件
  const relativePath = path.join(__dirname, moduleName);
  return relativePath;
}
