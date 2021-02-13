import assert from "assert";

import { NameMC } from "../esm/NameMC.mjs";
import { WrapperError } from "../dist/WrapperError.js";

const nameMc = new NameMC();

describe("Skins", () => {
    describe("skinHistory();", () => {
        it("Checking the method for errors", async () => {
            await nameMc.skinHistory({
                nickname: "MrZillaGold"
            });
        });

        it("Checking the method for errors with uuid", async () => {
            await nameMc.skinHistory({
                nickname: "5dcafb2f-bd76-4a85-8b25-3c22079ce358"
            });
        });

        it("Check for an error with an incorrect nickname format", () => {
            assert.rejects(() => nameMc.skinHistory({
                nickname: "1 2 3"
            }), new WrapperError(2));
        });
    });

    describe("transformSkin();", () => {
        it("Transform skin and compare result with pattern", (done) => {
            nameMc.transformSkin({
                skin: "12b92a9206470fe2",
                transformation: "grayscale"
            })
                .then(({ url }) => {
                    assert.strictEqual(url, "https://namemc.com/texture/d1bf6a06a65d674a.png");

                    done();
                })
                .catch(done);
        });
    });

    describe("getSkins();", () => {
        it("Receive data and check array size", (done) => {
            nameMc.getSkins()
                .then((skins) => {
                    assert.strictEqual(skins.length, 30);

                    done();
                })
                .catch(done);
        });
    });
});

describe("Capes", () => {
    describe("getCapes();", () => {
        it("Check for equality of results to a pattern", (done) => {
            const pattern = [
                {
                    hash: "77421d9cf72e07e9",
                    url: "https://namemc.com/texture/77421d9cf72e07e9.png",
                    type: "minecraft",
                    name: "dannyBstyle"
                }
            ];

            nameMc.getCapes("dannyBstyle")
                .then((capes) => {
                    assert.strictEqual(JSON.stringify(capes), JSON.stringify(pattern));

                    done();
                })
                .catch(done);
        });

        it("Check for an error with an incorrect nickname format", () => {
            assert.rejects(() => nameMc.getCapes("1 2 3"), new WrapperError(2));
        });
    });

    describe("getCapeType();", () => {
        it("Check for equality of results to a pattern", async () => {
            const pattern = {
                type: "optifine",
                name: "Optifine"
            };

            const capeType = nameMc.getCapeInfo("7ac79667ca6d906d");

            assert.strictEqual(JSON.stringify(capeType), JSON.stringify(pattern))
        });
    });
});

describe("Friends", () => {
    describe("getFriends();", () => {

        it("Checking the method for errors", async () => {
            await nameMc.getFriends("MrZillaGold");
        });

        it("Checking the method for errors with uuid", async () => {
            await nameMc.getFriends("5dcafb2f-bd76-4a85-8b25-3c22079ce358");
        });

        it("Check for an error with an incorrect nickname format", () => {
            assert.rejects(() => nameMc.getFriends("1 2 3"), new WrapperError(2));
        });
    });
});

describe("Players", () => {
    describe("getNicknameHistory();", () => {
        it("Checking the method for errors", async () => {
            await nameMc.getNicknameHistory("MrZillaGold");
        });

        it("Checking the method for errors with uuid", async () => {
            await nameMc.getNicknameHistory("5dcafb2f-bd76-4a85-8b25-3c22079ce358");
        });

        it("Check for an error with an incorrect nickname format", () => {
            assert.rejects(() => nameMc.getNicknameHistory("1 2 3"), new WrapperError(2));
        });
    });

    describe("getPlayerInfo();", () => {
        it("Checking the method for errors", async () => {
            await nameMc.getPlayerInfo("MrZillaGold");
        });

        it("Checking the method for errors with uuid", async () => {
            await nameMc.getPlayerInfo("5dcafb2f-bd76-4a85-8b25-3c22079ce358");
        });

        it("Check for an error with an incorrect nickname format", () => {
            assert.rejects(() => nameMc.getPlayerInfo("1 2 3"), new WrapperError(2));
        });
    });
});

describe("Servers", () => {
    describe("getServers();", () => {
        it("Checking the method for errors", async () => {
            for (let page = 1; page < 30; page++) {
                await nameMc.getServers(page);
            }
        });
    });

    describe("getServer();", () => {
        it("Checking the method for errors", async () => {
            await nameMc.getServer("hypixel.net");
            await nameMc.getServer("minecraftonline.com");
        });
    });

    describe("getServerLikes();", () => {
        it("Response must be array", async () => {
            await nameMc.getServerLikes("hypixel.net")
                .then((likes) =>
                    assert.ok(Array.isArray(likes))
                );
        });
    });

    describe("checkServerLike();", () => {
        it("Check server like with uuid", async () => {
            await nameMc.checkServerLike({
                ip: "hypixel.net",
                nickname: "5dcafb2f-bd76-4a85-8b25-3c22079ce358"
            })
                .then(assert.ok);
        });

        it("Check server like with nickname", async () => {
            await nameMc.checkServerLike({
                ip: "hypixel.net",
                nickname: "MrZillaGold"
            })
                .then(assert.ok);
        });
    });
});
