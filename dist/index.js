import fs from 'fs';
import path from 'path';

function main() {
    console.log("clicli --entry");
    console.log("reading files...");
    const templatePath = path.resolve(process.cwd(), "templates");
    const templateFiles = fs.readdirSync(templatePath);
    templateFiles.forEach((file) => {
        const filePath = path.join(templatePath, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        console.log(`${file}: `, fileContent);
    });
    console.log("complete");
}

export { main };