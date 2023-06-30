import fs from "fs";
import path from "path";

const __dirname = path.dirname(import.meta.url);

/**
 * Run a fully customized walk.
 * @param {string} content File content.
 * @param {string} ext File extension.
 * @param {string} dir Directory path of the file.
 * @param {Function[]} walkers Walkers.
 * @param {any} options Walk options.
 * @returns {Promise<string>} Result.
 */
export async function doWalk(content, ext, dir, walkers, options) {
    const walker = await import(path.join(__dirname, "walkers", `${ext}.js`));
    return walker.default(content, dir, walkers, options);
}

/**
 * Walk through a file.
 * @param {string} file Target file path.
 * @param {Function[]} walkers Walkers.
 * @param {any} options Walk options.
 * @returns {Promise<string>} Result.
 */
async function walk(file, walkers, options) {
    const content = fs.readFileSync(file, "utf-8");
    const ext = path.extname(file).substring(1);
    const dir = options?.rootDir || path.dirname(file);
    return doWalk(content, ext, dir, walkers, options);
}

export default walk;