import fs from "fs";
import path from "path";

import parser from "node-html-parser";
import minifyHtml from "@minify-html/node";

import { isURL } from "../util.js";

export default async function(content, dir, walkers, options) {
    const el = parser.parse(content);
    const processors = [];

    function walkerCallback(selector, attribute, callback) {
        el.querySelectorAll(selector).forEach((v) => {
            const attr = v.getAttribute(attribute);
            if (attr && !isURL(attr)) {
                const assetPath = path.join(dir, attr);
                if (fs.existsSync(assetPath) && fs.lstatSync(assetPath).isFile()) {
                    processors.push(callback({
                        element: v,
                        attribute,
                        asset: assetPath,
                        dir
                    }));
                }
            }
        })
    }
    for (const walker of walkers) {
        walker(walkerCallback);
    }

    await Promise.allSettled(processors);
    if (options?.minifyHtml) {
        return minifyHtml.minify(Buffer.from(el.toString()), options?.minifyHtmlOptions || {});
    } else {
        return el.toString();
    }
}