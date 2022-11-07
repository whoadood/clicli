import fs from 'fs-extra';
import path from 'path';

function main() {
    console.log("clicli --entry");
    console.log("reading files...");
    const templatePath = path.resolve(process.cwd(), "templates");
    const templateFiles = fs.readdirSync(templatePath);
    const fileOptions = templateFiles.map((file) => {
        const filePath = path.join(templatePath, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        return {
            inUse: Math.floor(Math.random() * 2) === 1,
            file: { filePath, fileName: file, fileContent },
        };
    });
    selectFile({
        index: fileOptions[0],
        markdown: fileOptions[1],
        readme: fileOptions[2],
    });
    console.log("complete");
}
function selectFile(options) {
    if (options.index.inUse) {
        console.log("\nindex in use");
        logFile(options.index);
    }
    if (options.markdown.inUse) {
        console.log("\nmarkdown in use");
        logFile(options.markdown);
    }
    if (options.readme.inUse) {
        console.log("\nreadme in use");
        logFile(options.readme);
    }
}
function logFile(option) {
    if (option.inUse) {
        console.log(`${option.file.fileName}: `, option.file.fileContent);
    }
}

export { main };
