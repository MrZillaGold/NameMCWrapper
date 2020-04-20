import assert from "assert";

import {
    NameMC
} from "../index.mjs";
import ErrorHandler from "../src/error.mjs";

const nameMc = new NameMC();

const WrapperError = new ErrorHandler();

describe("Skin", function() {
    describe("skinHistory();", function() {
        it("Check for equality of results to a pattern", function(done) {
            this.timeout(5000);

            const pattern = [
                {
                    date: "2016-03-14T15:37:05.756Z",
                    url: "https://namemc.com/texture/5d5eb6d84b57ea29.png",
                    hash: "5d5eb6d84b57ea29",
                    isSlim: false,
                    renders: {
                        body: {
                            front: "https://render.namemc.com/skin/3d/body.png?skin=5d5eb6d84b57ea29&model=classic&width=600&height=300",
                            front_and_back: "https://render.namemc.com/skin/3d/body.png?skin=5d5eb6d84b57ea29&model=classic&width=600&height=300&front_and_back"
                        },
                        face: "https://render.namemc.com/skin/2d/face.png?skin=5d5eb6d84b57ea29&overlay&scale=4"
                    }
                }
            ];

            nameMc.skinHistory("Notch")
                .then(skins => {
                    assert.equal(JSON.stringify(skins), JSON.stringify(pattern));

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
                    assert.equal(url, "https://namemc.com/texture/d1bf6a06a65d674a.png");

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
                    assert.equal(JSON.stringify(capes), JSON.stringify(pattern));

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

            assert.equal(JSON.stringify(capeType), JSON.stringify(pattern))
        });
    });
});

describe("Friends", function() {
    describe("getFriends();", function() {

        it("Check for equality of results to a pattern", function(done) {
            this.timeout(5000);

            const pattern = [
                { uuid: "15c28191-b1c9-443c-a3a2-b44795c741a6", name: "loner01" },
                { uuid: "61f99982-77db-4dbd-be29-0737dc708c0d", name: "spoodov" },
                { uuid: "a372a0e9-d6c1-4754-9e1d-01fa9339e71d", name: "Vyacheslav" }
            ];

            nameMc.getFriends("MrZillaGold")
                .then(friends => {
                    assert.equal(JSON.stringify(friends), JSON.stringify(pattern));

                    done();
                })
                .catch(done);
        });

        it("Check for an error with an incorrect nickname format", async function() {
            await assert.rejects(async (done) => {

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

            assert.equal(proxy, nameMc.options.proxy);
            assert.equal(endpoint, nameMc.options.endpoint);
        });
    });
});
