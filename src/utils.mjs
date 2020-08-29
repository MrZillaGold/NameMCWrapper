const nameRegExp = /^[A-Za-z0-9_]{2,16}$/;
const profileRegExp = /[^]+\/profile\/[^]+/;
const skinRegExp = /[^]+\/skin\/([^]+)/;

const capes = new Map([
    ["1981aad373fa9754", "MineCon 2016"],
    ["72ee2cfcefbfc081", "MineCon 2015"],
    ["0e4cc75a5f8a886d", "MineCon 2013"],
    ["ebc798c3f7eca2a3", "MineCon 2012"],
    ["9349fa25c64ae935", "MineCon 2011"],
    ["11a3dcc4d826d0a1", "Realms Mapmaker"],
    ["cb5dd34bee340182", "Mojang"],
    ["129a4675704fa3b8", "Translator"],
    ["8dd71c1ee6ec0ae4", "Mojira Moderator"],
    ["696b6cc29946b968", "Cobalt"],
    ["298ae017a64261ad", "Mojang (Classic)"],
    ["116bacd62b233157", "Scrolls"],
    ["d059f1a18b159eb6", "Translator (Chinese)"],
    ["aa02d4b62762ff22", "cheapsh0t"],
    ["77421d9cf72e07e9", "dannyBstyle"],
    ["5e68fa78bd9df310", "JulianClark"],
    ["d3c7ac835b24eb29", "Millionth Customer"],
    ["7a939dc1a7ad4505", "MrMessiah"],
    ["88f1509813f4e324", "Prismarine"],
    ["8c05ef3c54870d04", "Turtle"]
]);

export {
    nameRegExp,
    profileRegExp,
    skinRegExp,
    capes
}
