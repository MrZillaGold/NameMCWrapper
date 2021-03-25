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
        it("Get skins and check array size", async () => {
            const skins = await nameMc.getSkins();
            
            assert.strictEqual(skins.length, 30);
        });
        
        it("Get skins with custom tag and check array size", async () => {
            const skins = await nameMc.getSkins({
                tab: "tag",
                section: "girl"
            });
            
            assert.strictEqual(skins.length, 30);
        });
    });
});

describe("Capes", () => {
    describe("getCapes();", () => {
        it("Checking the method for errors", async () => {
            await nameMc.getCapes("dad");
        });

        it("Check for an error with an incorrect nickname format", () => {
            assert.rejects(() => nameMc.getCapes("1 2 3"), new WrapperError(2));
        });
    });

    describe("getCapeType();", () => {
        it("Check for equality of results to a pattern", () => {
            const pattern = {
                type: "optifine",
                name: "Optifine"
            };

            const capeType = nameMc.getCapeInfo("7ac79667ca6d906d");

            assert.strictEqual(JSON.stringify(capeType), JSON.stringify(pattern));
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
    describe("getPlayer();", () => {
        it("Checking the method for errors", async () => {
            await nameMc.getPlayer("MrZillaGold");
        });

        it("Checking the method for errors with uuid", async () => {
            await nameMc.getPlayer("5dcafb2f-bd76-4a85-8b25-3c22079ce358");
        });

        it("Check for an error with an incorrect nickname format", () => {
            assert.rejects(() => nameMc.getPlayer("1 2 3"), new WrapperError(2));
        });

        it("Checking name history length", async () => {
            const player = await nameMc.getPlayer("jeb_");

            assert.ok(player.names.length > 0);
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
        describe("Checking the method for errors", () => {
            for (let page = 1; page <= 30; page++) {
                it(`Check ${page} page for errors`, async () => {
                    await nameMc.getServers(page);
                });
            }
        });
    });

    describe("getServer();", () => {
        it("Checking the method for errors", async () => {
            await Promise.all([
                nameMc.getServer("hypixel.net"),
                nameMc.getServer("minecraftonline.com")
            ]);
        });
    });

    describe("getServerLikes();", () => {
        it("Response must be array", async () => {
            await nameMc.getServerLikes("hypixel.net")
                .then((likes) => assert.ok(Array.isArray(likes)));
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
