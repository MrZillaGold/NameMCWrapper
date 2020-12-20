import assert from "assert";

export const tests = (nameMc, WrapperError, type) => {

    describe(type, () => {
        describe("Skin", () => {
            describe("skinHistory();", () => {
                it("Checking the method for errors", (done) => {
                    assert.doesNotReject(() => nameMc.skinHistory("MrZillaGold"))
                        .then(done)
                        .catch(done);
                });

                it("Checking the method for errors with uuid", (done) => {
                    assert.doesNotReject(() => nameMc.skinHistory("5dcafb2f-bd76-4a85-8b25-3c22079ce358"))
                        .then(done)
                        .catch(done);
                });

                it("Check for an error with an incorrect nickname format", () => {
                    assert.rejects(() => nameMc.skinHistory("1 2 3"), new WrapperError(2));
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

        describe("Cape", () => {
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

                    const capeType = nameMc.getCapeType("7ac79667ca6d906d");

                    assert.strictEqual(JSON.stringify(capeType), JSON.stringify(pattern))
                });
            });
        });

        describe("Friends", () => {
            describe("getFriends();", () => {

                it("Checking the method for errors", (done) => {
                    assert.doesNotReject(() => nameMc.getFriends("MrZillaGold"))
                        .then(done)
                        .catch(done);
                });

                it("Checking the method for errors with uuid", (done) => {
                    assert.doesNotReject(() => nameMc.getFriends("5dcafb2f-bd76-4a85-8b25-3c22079ce358"))
                        .then(done)
                        .catch(done);
                });

                it("Check for an error with an incorrect nickname format", () => {
                    assert.rejects(() => nameMc.getFriends("1 2 3"), new WrapperError(2));
                });
            });
        });

        describe("Player", () => {
            describe("getNicknameHistory();", () => {
                it("Checking the method for errors", (done) => {
                    assert.doesNotReject(() => nameMc.getNicknameHistory("MrZillaGold"))
                        .then(done)
                        .catch(done);
                });

                it("Checking the method for errors with uuid", (done) => {
                    assert.doesNotReject(() => nameMc.getNicknameHistory("5dcafb2f-bd76-4a85-8b25-3c22079ce358"))
                        .then(done)
                        .catch(done);
                });

                it("Check for an error with an incorrect nickname format", () => {
                    assert.rejects(() => nameMc.getNicknameHistory("1 2 3"), new WrapperError(2));
                });
            });

            describe("getPlayerInfo();", () => {
                it("Checking the method for errors", (done) => {
                    assert.doesNotReject(() => nameMc.getPlayerInfo("MrZillaGold"))
                        .then(done)
                        .catch(done);
                });

                it("Checking the method for errors with uuid", (done) => {
                    assert.doesNotReject(() => nameMc.getPlayerInfo("5dcafb2f-bd76-4a85-8b25-3c22079ce358"))
                        .then(done)
                        .catch(done);
                });

                it("Check for an error with an incorrect nickname format", () => {
                    assert.rejects(() => nameMc.getPlayerInfo("1 2 3"), new WrapperError(2));
                });
            });
        });
    });
};