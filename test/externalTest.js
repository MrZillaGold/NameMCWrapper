import assert from "assert";

import { NameMC } from "../index.mjs";
import ErrorHandler from "../src/error.mjs";

const nameMc = new NameMC();

const WrapperError = new ErrorHandler();

describe("Skin", function() {
    describe("skinHistory();", function() {
        it("Check for equality of results to a pattern", function(done) {
            this.timeout(5000);

            const pattern = [
                {
                    url: "https://namemc.com/texture/5d5eb6d84b57ea29.png",
                    hash: "5d5eb6d84b57ea29",
                    isSlim: false,
                    renders: {
                        body: {
                            front: "https://render.namemc.com/skin/3d/body.png?skin=5d5eb6d84b57ea29&model=classic&width=600&height=300&theta=-30",
                            front_and_back: "https://render.namemc.com/skin/3d/body.png?skin=5d5eb6d84b57ea29&model=classic&width=600&height=300&front_and_back&theta=-30"
                        },
                        face: "https://render.namemc.com/skin/2d/face.png?skin=5d5eb6d84b57ea29&overlay=true&scale=4"
                    },
                    rating: 1259
                }
            ];

            nameMc.skinHistory("Notch")
                .then(skins => {
                    assert.strictEqual(JSON.stringify(skins), JSON.stringify(pattern));

                    done();
                })
                .catch(done);
        });

        it("Check for an error with an incorrect nickname format", async function() {
            await assert.rejects(async (done) => {

                await nameMc.skinHistory("1 2 3");

                done();

            }, WrapperError.get(2));
        });
    });

    describe("transformSkin();", function() {
        it("Transform skin and compare result with pattern", function(done) {
            this.timeout(5000);

            nameMc.transformSkin({
                skin: "12b92a9206470fe2",
                transformation: "grayscale"
            })
                .then(url => {
                    assert.strictEqual(url, "https://namemc.com/texture/d1bf6a06a65d674a.png");

                    done();
                })
                .catch(done);
        });
    });

    describe("getSkins();", function() {
        it("Receive data and check array size", function(done) {
            this.timeout(5000);

            nameMc.getSkins()
                .then(skins => {
                    assert.strictEqual(skins.length, 30);

                    done();
                })
                .catch(done);
        });
    });
});

describe("Cape", function() {
    describe("getCapes();", function() {
        it("Check for equality of results to a pattern", function(done) {
            this.timeout(5000);

            const pattern = [
                {
                    hash: "77421d9cf72e07e9",
                    url: "https://namemc.com/texture/77421d9cf72e07e9.png",
                    type: "minecraft",
                    name: "dannyBstyle"
                }
            ];

            nameMc.getCapes("dannyBstyle")
                .then(capes => {
                    assert.strictEqual(JSON.stringify(capes), JSON.stringify(pattern));

                    done();
                })
                .catch(done);
        });

        it("Check for an error with an incorrect nickname format", async function() {
            await assert.rejects(async (done) => {

                await nameMc.getCapes("1 2 3");

                done();

            }, WrapperError.get(2));
        });
    });

    describe("getCapeType();", function() {
        it("Check for equality of results to a pattern", async function() {
            const pattern = {
                type: "optifine",
                name: "Optifine"
            };

            const capeType = nameMc.getCapeType("7ac79667ca6d906d");

            assert.strictEqual(JSON.stringify(capeType), JSON.stringify(pattern))
        });
    });
});

describe("Friends", function() {
    describe("getFriends();", function() {

        it("Checking the method for errors", function(done) {
            this.timeout(5000);

            assert.doesNotReject(() => nameMc.getFriends("MrZillaGold"))
                .then(done)
                .catch(done);
        });

        it("Check for an error with an incorrect nickname format", function() {
            assert.rejects(async (done) => {

                await nameMc.getFriends("1 2 3");

                done();

            }, WrapperError.get(2));
        });
    });
});

describe("Options", function() {
    describe("setOptions();", function() {
        it("Set options and check changes", function() {
            const proxy = "https://test.com";
            const endpoint = "https://ru.namemc.com";

            nameMc.setOptions({
                proxy,
                endpoint
            });

            assert.strictEqual(proxy, nameMc.options.proxy);
            assert.strictEqual(endpoint, nameMc.options.endpoint);
        });
    });
});
