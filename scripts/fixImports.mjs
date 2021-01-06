import { promises as fs } from "fs";

const DIST_DIR = "./dist";

await fs.readdir(DIST_DIR)
    .then((files) => {
        files.forEach(async (file) => {
            if (file.endsWith(".js")) {
                const filePath = `${DIST_DIR}/${file}`;

                fs.readFile(filePath)
                    .then((file) => {
                        file = file.toString();

                        file = file.replace(/\.default/gm, "")
                            .replace(/mjs/gm, "js");

                        fs.writeFile(filePath, file);
                    });
            }
        })
    });

await fs.rmdir("./build", { recursive: true });
