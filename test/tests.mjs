import assert from "assert";

import { NameMC } from "../esm/NameMC.mjs";

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
            }));
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
            const skins = await nameMc.getSkins({
                tab: "trending"
            });

            assert.strictEqual(skins.length, 30);
        });

        it("Get skins tags and check array size", async () => {
            const skins = await nameMc.getSkins({
                tab: "tag"
            });

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

    describe("getSkins();", () => {
        it("Get skins and check tags array size", async () => {
            const skin = await nameMc.getSkin("a4eaf5f46753cf75");

            assert.ok(skin.tags.length > 1);
        });
    });
});

describe("Capes", () => {
    describe("getCapeType();", () => {
        it("Checking the name of the cape for equal", () => {
            assert.strictEqual(nameMc.getCapeInfo("1981aad373fa9754").name, "MineCon 2016");
            assert.strictEqual(nameMc.getCapeInfo("7ac79667ca6d906d").name, "Optifine");
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
            assert.rejects(() => nameMc.getFriends("1 2 3"));
        });
    });
});

describe("Players", () => {
    describe("getPlayer();", () => {
        it("Checking the method for errors", async () => {
            const player = await nameMc.getPlayer("MrZillaGold");

            await player.loadPayload();
        });

        it("Checking the method for errors with uuid", async () => {
            const player = await nameMc.getPlayer("5dcafb2f-bd76-4a85-8b25-3c22079ce358");

            await player.loadPayload();
        });

        it("Check for an error with an incorrect nickname format", () => {
            assert.rejects(() => nameMc.getPlayer("1 2 3"));
        });

        it("Checking name history length", async () => {
            const player = await nameMc.getPlayer("jeb_");

            assert.ok(player.names.length > 0);
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
            ])
                .then(async ([hypixel]) => {
                    await hypixel.loadPayload();
                });
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
