import fs from "fs";
import path from "path";

const __dirname = path.dirname(import.meta.url);

export async function doWalk(content, ext, dir, walkers, options) {
    const walker = await import(path.join(__dirname, "walkers", `${ext}.js`));
    return walker.default(content, dir, walkers, options);
}

async function walk(file, walkers, options) {
    const content = fs.readFileSync(file, "utf-8");
    const ext = path.extname(file).substring(1);
    const dir = path.dirname(file);
    return doWalk(content, ext, dir, walkers, options);
}

export default walk;