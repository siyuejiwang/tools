import fs from "fs";
import paths from "path";
export function getHtmlTemplate(temPath, config = {}) {
  const tempCode = fs.readFileSync(
    paths.resolve(process.cwd(), temPath),
    "utf-8"
  );
  return tempCode
    .replace(/<%= (.*?) %>/g, (match, p1) => {
      return config[p1] ?? "";
    })
    .replace(
      "</body>",
      `<script type="module" src="/src/index.tsx"></script></body>`
    );
}
