import fs from 'fs-extra';
import path from 'path';
import arg from 'arg';

function main() {
    console.log("clicli --entry");
    const options = parseOptions(process.argv);
    console.log("reading files...");
    const templatePath = path.resolve(process.cwd(), "tmp");
    const templateFiles = fs.readdirSync(templatePath);
    const [index, markdown, readme] = templateFiles.map((file) => {
        const filePath = path.join(templatePath, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const fileSlug = file.split(".")[0];
        let inUse;
        if (fileSlug === "index" && options["--index"]) {
            inUse = true;
        }
        else if (fileSlug === "markdown" && options["--markdown"]) {
            inUse = true;
        }
        else if (fileSlug === "readme" && options["--readme"]) {
            inUse = true;
        }
        else {
            inUse = false;
        }
        let installer;
        if (fileSlug === "index") {
            installer = indexInstaller;
        }
        else if (fileSlug === "markdown") {
            installer = markdownInstaller;
        }
        else if (fileSlug === "readme") {
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
function selectFile(options) {
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
const destPath = path.join(process.cwd(), "testDest");
function logFile(option) {
    console.log(`${option.file.fileName}: `, option.file.filePath);
    const destFile = path.join(destPath, option.file.fileName);
    fs.copyFileSync(option.file.filePath, destFile);
}
function indexInstaller(option) {
    logFile(option);
}
function markdownInstaller(option) {
    logFile(option);
}
function readmeInstaller(option) {
    logFile(option);
}
function parseOptions(args) {
    const parsedArgs = arg({
        "--index": Boolean,
        "--markdown": Boolean,
        "--readme": Boolean,
        "-i": "--index",
        "-m": "--markdown",
        "-r": "--readme",
    }, {
        argv: args.slice(2),
    });
    return parsedArgs;
}

export { main };
