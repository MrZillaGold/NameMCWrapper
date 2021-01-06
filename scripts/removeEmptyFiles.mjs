import { promises as fs } from "fs";

import tsconfig from "../tsconfig.json";

const OUT_DIR = tsconfig.compilerOptions.outDir;

const INTERFACES_DIR = `./${OUT_DIR}/interfaces`;

fs.readdir(INTERFACES_DIR)
    .then((files) => {
        files.forEach(async (file) => {
            if (file.endsWith(".js")) {
                await fs.unlink(`${INTERFACES_DIR}/${file}`);
            }
        })
    });

await fs.unlink(`${OUT_DIR}/interfaces.js`);
