import fs from "fs";
import path from "path";

import parser from "css";

import { isURL } from "../util.js";

export default async function(content, dir, walkers, options) {
    const css = parser.parse(content);

    for (const rule of css.stylesheet.rules) {
        for (const declaration of rule.declarations) {
            if (declaration.value) {
                let value = declaration.value;
                const urls = value.matchAll(/url\((.+?)\)/g);
                for (const url of urls) {
                    const originalUrl = url[0];
                    const urlCont = url[1];
                    if (!isURL(urlCont)) {
                        const assetPath = path.join(dir, urlCont);
                        if (fs.existsSync(assetPath) && fs.lstatSync(assetPath).isFile()) {
                            for (const walker of walkers) {
                                await walker({
                                    declaration,
                                    url: originalUrl,
                                    asset: assetPath,
                                    dir
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    return parser.stringify(css, { compress: options?.minifyCss || false });
}