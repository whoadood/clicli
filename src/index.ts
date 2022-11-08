import fs from "fs-extra";
import path from "path";
import arg from "arg";

type fileOption = {
  inUse: boolean;
  file: {
    filePath: string;
    fileName: string;
    fileContent: string;
    installer: ((option: fileOption) => void) | undefined;
  };
};

type Options = {
  index: fileOption;
  markdown: fileOption;
  readme: fileOption;
};

export function main() {
  console.log("clicli --entry");

  const options = parseOptions(process.argv);

  console.log("reading files...");
  const templatePath = path.resolve(process.cwd(), "templates");
  const templateFiles = fs.readdirSync(templatePath);

  const [index, markdown, readme] = templateFiles.map((file: string) => {
    const filePath = path.join(templatePath, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const fileSlug = file.split(".")[0];
    let inUse;
    if (fileSlug === "index" && options["--index"]) {
      inUse = true;
    } else if (fileSlug === "markdown" && options["--markdown"]) {
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
    }

    return {
      inUse: inUse,
      file: { filePath, fileName: file, fileContent, installer },
    };
  });

  selectFile({
    index: index,
    markdown: markdown,
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
  if (options.readme.inUse) {
    console.log("\nreadme in use");
    if (options.readme.file.installer)
      options.readme.file.installer(options.readme);
  }
}

function logFile(option: fileOption) {
  console.log(`${option.file.fileName}: `, option.file.filePath);
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

function parseOptions(args: string[]) {
  const parsedArgs = arg(
    {
      "--index": Boolean,
      "--markdown": Boolean,
      "--readme": Boolean,
      "-i": "--index",
      "-m": "--markdown",
      "-r": "--readme",
    },
    {
      argv: args.slice(2),
    }
  );

  return parsedArgs;
}
