import fs from "fs";
import path from "path";

import parser from "css";

import { isURL } from "../util.js";

export default async function(content, dir, walkers) {
    const css = parser.parse(content);
    const cssWalkers = walkers.filter((walker) => walker[0] == "css");

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
                        if (fs.existsSync(assetPath)) {
                            for (const walker of cssWalkers) {
                                await walker[1]({
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
    return parser.stringify(css);
}