import { promises as fs } from "fs";

import tsconfig from "../tsconfig.json";

const OUT_DIR = tsconfig.compilerOptions.outDir;

const INTERFACES_DIR = `./${OUT_DIR}/interfaces`;

const INTERFACES_PATH = [
    `${INTERFACES_DIR}/NameMC`,
    `${INTERFACES_DIR}/API`
];

INTERFACES_PATH.forEach((path) => {
    fs.readdir(path)
        .then((files) => {
            files.forEach(async (file) => {
                if (file.endsWith(".js")) {
                    await fs.unlink(`${path}/${file}`);
                }
            })
        });
});

await fs.unlink(`${OUT_DIR}/interfaces.js`);
