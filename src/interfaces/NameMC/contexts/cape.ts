import { IContextOptions } from "./context";
import { Hash } from "./skin";

export interface ICapeContextOptions extends IContextOptions<ICapeContext> {
    hash: Hash;
}

export interface ICapeContext {
    hash: string;
    url: string;
    name: CapeName;
    type: CapeType;
}

export enum CapeType {
    MINECRAFT = "minecraft",
    OPTIFINE = "optifine"
}

export enum CapeName {
    MINECON_2016 = "MineCon 2016",
    MINECON_2015 = "MineCon 2015",
    MINECON_2013 = "MineCon 2013",
    MINECON_2012 = "MineCon 2012",
    MINECON_2011 = "MineCon 2011",
    REALMS_MAPMAKER = "Realms Mapmaker",
    MOJANG = "Mojang",
    MOJANG_CLASSIC = "Mojang (Classic)",
    TRANSLATOR = "Translator",
    TRANSLATOR_CHINESE = "Translator (Chinese)",
    TRANSLATOR_JAPANESE = "Translator (Japanese)",
    MOJIRA_MODERATOR = "Mojira Moderator",
    COBALT = "Cobalt",
    SCROLLS = "Scrolls",
    DB = "dB",
    SNOWMAN = "Snowman",
    MILLIONTH_CUSTOMER = "Millionth Customer",
    SPADE = "Spade",
    PRISMARINE = "Prismarine",
    TURTLE = "Turtle",
    OPTIFINE = "Optifine"
}

export enum CapeHash {
    MINECON_2016 = "1981aad373fa9754",
    MINECON_2015 = "72ee2cfcefbfc081",
    MINECON_2013 = "0e4cc75a5f8a886d",
    MINECON_2012 = "ebc798c3f7eca2a3",
    MINECON_2011 = "9349fa25c64ae935",
    REALMS_MAPMAKER = "11a3dcc4d826d0a1",
    MOJANG = "cb5dd34bee340182",
    MOJANG_CLASSIC = "298ae017a64261ad",
    TRANSLATOR = "129a4675704fa3b8",
    TRANSLATOR_CHINESE = "d059f1a18b159eb6",
    TRANSLATOR_JAPANESE = "aa02d4b62762ff22",
    MOJIRA_MODERATOR = "8dd71c1ee6ec0ae4",
    COBALT = "696b6cc29946b968",
    SCROLLS = "116bacd62b233157",
    DB = "77421d9cf72e07e9",
    SNOWMAN = "5e68fa78bd9df310",
    MILLIONTH_CUSTOMER = "d3c7ac835b24eb29",
    SPADE = "7a939dc1a7ad4505",
    PRISMARINE = "88f1509813f4e324",
    TURTLE = "8c05ef3c54870d04"
}
