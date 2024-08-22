#!/usr/bin/env node

// program
//   .command('greet')
//   .description('Display a greeting message')
//   .action(() => {
//     console.log('Hello, world!');
//   });

// mfy-cli add page xxxx
// mfy-cli add component xxx
const { program } = require("commander");
const child_process = require("child_process");
const { clearInterval } = require("timers");
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const generator = require("@babel/generator").default;
const traverse = require("@babel/traverse").default;
program
  .option("-f, --fragments <fragment...>", "请输入插入代码中的片段名称")
  .option("-c, --components <component...>", "请输入要使用的组件名称");

program.parse();
console.log(program.opts());

function intervalProgress() {
  const readline = require("readline");
  const unloadChar = "-";
  const loadedChar = "=";

  let i = 0;
  let time = setInterval(() => {
    if (i > 10) {
      clearInterval(time);
      console.log(`创建完成，请查收`);
      process.exit(0);
    }
    readline.cursorTo(process.stdout, 0, 1);
    readline.clearScreenDown(process.stdout);
    renderProgress("文件创建中", i);
    i++;
  }, 200);

  function renderProgress(text, step) {
    const PERCENT = Math.round(step * 10);
    const COUNT = 2;
    const unloadStr = new Array(COUNT * (10 - step)).fill(unloadChar).join("");
    const loadedStr = new Array(COUNT * step).fill(loadedChar).join("");
    process.stdout.write(`${text}:【${loadedStr}${unloadStr}|${PERCENT}%】`);
  }
}

function exec(process, command) {
  return new Promise((resolve, reject) => {
    const subProcess = process.exec(command, function (err, stdout) {
      if (err) reject(error);
      resolve(subProcess);
    });
  });
}
function parseAst(filePath, name) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const ast = parser.parse(fileContent, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
  return ast;
}
function getAst(filePath, name) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const ast = parser.parse(fileContent, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
  let jsxStart = null;
  let jsxEnd = null;
  let functionBodyStart = null;
  let functionReturnStart = null;
  let functionStart = null;

  // 定义一个遍历器，查找return语句
  traverse(ast, {
    FunctionDeclaration(path) {
      const { node } = path;
      if (node.id?.name.toLowerCase() === name.toLowerCase()) {
        functionStart = node.start;
        const bodyList = node.body.body;
        functionBodyStart = bodyList[0].start;
        for (let i = bodyList.length - 1; i > 0; i--) {
          if (bodyList[i].type === "ReturnStatement") {
            functionReturnStart = bodyList[i].start;
            const children = bodyList[i].argument.children;
            jsxStart = children[0].start;
            jsxEnd = children[children.length - 1].end;
            break;
          }
        }
        console.log(node);
      }
    },
  });
  return {
    importNodes: fileContent.substring(0, functionStart),
    componentJS: fileContent.substring(functionBodyStart, functionReturnStart),
    componentJSX: fileContent.substring(jsxStart, jsxEnd),
  };
}

async function addPage(name, opts) {
  let returnObj;
  if (opts.fragments) {
    returnObj = getAst(
      path.resolve(__dirname, "./template/fragments/List/index.tsx"),
      "List"
    );
  }
  // 页面名称
  // 判断pages 文件夹是否存在
  if (fs.existsSync(`./pages`) && !fs.existsSync(`./pages/${name}`)) {
    let subProcess = await exec(child_process, `cd ./pages && mkdir ${name}`);
    // 读取 tempalte/index.tsx 的文件
    let templatStr = "";
    if (returnObj) {
      templatStr = `import classNames from "classnames";import React from "react";import styles from "./index.module.less";${returnObj.importNodes}
      function Template(props: any) {
        const { className } = props;
        ${returnObj.componentJS}
        return (
          <div className={classNames(styles.container, props.className)}>
            ${returnObj.componentJSX}
          </div>
        );
      };
      export default Template;`;
      const ast = parser.parse(templatStr, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });
      traverse(ast);
      const {code} = generator(ast, {}, templatStr);
      templatStr = code;
    } else {
      templatStr = fs.readFileSync(
        path.resolve(__dirname, "./template/index.tsx"),
        "utf8"
      );
    }
    console.log(templatStr);
    fs.writeFile(`./pages/${name}/index.tsx`, templatStr, (err) => {
      console.log(err);
    });
    fs.writeFile(`./pages/${name}/index.module.less`, "", (err) => {
      console.log(err);
    });
    fs.writeFile(`./pages/${name}/dto.ts`, "", (err) => {
      console.log(err);
    });
    subProcess.kill();
    subProcess = await exec(child_process, `cd ./pages/${name} && mkdir components`);
    fs.writeFile(`./pages/${name}/components/index.ts`, "", (err) => {
      console.log(err);
    });
    subProcess.kill();
  }
}
function addComponent(name) {
  // 组件名称
  // 判断components 文件夹是否存在
  if (fs.existsSync(`./components`) && !fs.existsSync(`./components/${name}`)) {
    let subProcess = child_process.exec(
      "cd ./components && mkdir " + name,
      function (err, stdout) {
        if (err) console.log(err);
        // 读取 tempalte/index.tsx 的文件
        let tempalteStr = fs.readFileSync(
          path.resolve(__dirname, "./template/index.tsx")
        );
        fs.writeFile(`./components/${name}/index.tsx`, tempalteStr, (err) => {
          console.log(err);
        });
        // 创建style less
        fs.writeFile(`./components/${name}/index.module.less`, "", (err) => {
          console.log(err);
        });
        // 创建dto.ts
        fs.writeFile(`./components/${name}/dto.ts`, "", (err) => {
          console.log(err);
        });
        subProcess.kill();
      }
    );
  }
}

function main() {
  const [, , action, type, name] = process.argv;
  console.log(process.argv);
  if (action == "add") {
    if (type == "page") {
      const opts = program.opts();
      addPage(name, opts);
    }
  }
  // 展示进度条
  //  intervalProgress();
  // 精确点： 实时查询新建的几个文件（文件夹）是否创建成功，如果创建完毕，应该提前结束进度条
}

main();
