import fs from "fs-extra";
import path from "path";
import arg from "arg";
import { fileURLToPath } from "url";

/* 
The first option for compiling .ts files is of course tsc and it does its job well, but there is one problem. Node requires us to specify extensions when using ES Modules, so we must import each file as import something from './something.ts'. When this code is compiled with tsc, it retains the .ts extension, which makes it impossible to run. There are options for changing extensions after compilation, but it can be easily done with a bundler. This is why we need Rollup.
*/

type fileOption = {
  inUse: boolean;
  file: {
    filePath: string;
    fileName: string;
    fileContent: string | Record<string, string>;
    installer: ((option: fileOption) => void) | undefined;
  };
};

type Options = {
  index: fileOption;
  markdown: fileOption;
  readme: fileOption;
  pkg: fileOption;
};

const deps = {
  arg: "^5.0.2",
  chalk: "^5.1.2",
  figlet: "^1.5.2",
  "fs-extra": "^10.1.0",
  "gradient-string": "^2.0.2",
  inquirer: "^9.1.4",
};

const devDeps = {
  "@rollup/plugin-typescript": "^9.0.2",
  "@types/figlet": "^1.5.5",
  "@types/fs-extra": "^9.0.13",
  "@types/gradient-string": "^1.1.2",
  "@types/inquirer": "^9.0.2",
  "@types/node": "^18.11.9",
  rollup: "^3.2.5",
  tslib: "^2.4.1",
  typescript: "^4.8.4",
};

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
const PKG_ROOT = path.join(distPath, "../");

export function main() {
  console.log("clicli --entry");

  const options = parseOptions(process.argv);

  console.log("reading files...");
  const templatePath = path.resolve(PKG_ROOT, "tmp");
  const templateFiles = fs.readdirSync(templatePath);

  const [index, markdown, pkg, readme] = templateFiles.map((file: string) => {
    const filePath = path.join(templatePath, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const fileSlug = file.split(".")[0];

    let inUse;

    if (fileSlug === "index" && options["--index"]) {
      inUse = true;
    } else if (fileSlug === "markdown" && options["--markdown"]) {
      inUse = true;
    } else if (fileSlug === "package" && options["--package"]) {
      inUse = true;
    } else if (fileSlug === "readme" && options["--readme"]) {
      inUse = true;
    } else {
      inUse = false;
    }
    let installer;
    if (fileSlug === "index") {
      installer = indexInstaller;
    } else if (fileSlug === "markdown") {
      installer = markdownInstaller;
    } else if (fileSlug === "readme") {
      installer = readmeInstaller;
    } else if (fileSlug === "package") {
      installer = pacakgeInstaller;
    }

    return {
      inUse: inUse,
      file: { filePath, fileName: file, fileContent, installer },
    };
  });

  selectFile({
    index: index,
    markdown: markdown,
    pkg: pkg,
    readme: readme,
  });

  console.log("complete");
}

function selectFile(options: Options) {
  if (options.index.inUse) {
    console.log("\nindex in use");
    if (options.index.file.installer)
      options.index.file.installer(options.index);
  }
  if (options.markdown.inUse) {
    console.log("\nmarkdown in use");
    if (options.markdown.file.installer)
      options.markdown.file.installer(options.markdown);
  }
  if (options.pkg.inUse) {
    console.log("\npackage.json in use");
    if (options.pkg.file.installer) options.pkg.file.installer(options.pkg);
  }
  if (options.readme.inUse) {
    console.log("\nreadme in use");
    if (options.readme.file.installer)
      options.readme.file.installer(options.readme);
  }
}

const destPath = path.join(process.cwd(), "testDest");

function logFile(option: fileOption) {
  console.log(`${option.file.fileName}: `, option.file.filePath);
  if (option.file.fileName !== "package.json") {
    const destFile = path.join(destPath, option.file.fileName);
    fs.copyFileSync(option.file.filePath, destFile);
  }
  if (option.file.fileName === "package.json") {
    handlePkgJson(option);
  }
}

function indexInstaller(option: fileOption) {
  logFile(option);
}

function markdownInstaller(option: fileOption) {
  logFile(option);
}
function readmeInstaller(option: fileOption) {
  logFile(option);
}
function pacakgeInstaller(option: fileOption) {
  logFile(option);
}
function handlePkgJson(option: fileOption) {
  const content = fs.readJSONSync(option.file.filePath);
  content.devDependencies = devDeps;
  content.dependencies = deps;
  fs.writeJSONSync(path.join(destPath, option.file.fileName), content, {
    spaces: 2,
  });
}

function parseOptions(args: string[]) {
  const parsedArgs = arg(
    {
      "--index": Boolean,
      "--markdown": Boolean,
      "--readme": Boolean,
      "--package": Boolean,
      "-i": "--index",
      "-m": "--markdown",
      "-r": "--readme",
      "-p": "--package",
    },
    {
      argv: args.slice(2),
    }
  );

  return parsedArgs;
}
