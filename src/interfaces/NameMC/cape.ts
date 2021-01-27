import { Hash } from "./skin";

export type CapeType = "minecraft" | "optifine";
export type CapeName = "MineCon 2016" | "MineCon 2015" | "MineCon 2013" | "MineCon 2012" | "MineCon 2011" | "Realms Mapmaker" | "Mojang" | "Translator" | "Mojira Moderator" | "Cobalt" | "Mojang (Classic)" | "Scrolls" | "Translator (Chinese)" | "cheapsh0t" | "dannyBstyle" | "JulianClark" | "Millionth Customer" | "MrMessiah" | "Prismarine" | "Turtle" | "Optifine";
export type CapeHash = "1981aad373fa9754" | "72ee2cfcefbfc081" | "0e4cc75a5f8a886d" | "ebc798c3f7eca2a3" | "9349fa25c64ae935" | "11a3dcc4d826d0a1" | "cb5dd34bee340182" | "129a4675704fa3b8" | "8dd71c1ee6ec0ae4" | "696b6cc29946b968" | "298ae017a64261ad" | "116bacd62b233157" | "d059f1a18b159eb6" | "aa02d4b62762ff22" | "77421d9cf72e07e9" | "5e68fa78bd9df310" | "d3c7ac835b24eb29" | "7a939dc1a7ad4505" | "88f1509813f4e324" | "8c05ef3c54870d04" | Hash;

export type CapesMap = Map<CapeHash, CapeName>;

export interface ICapeInfo {
    type: CapeType;
    name: CapeName;
}

export interface ICape extends ICapeInfo {
    url: string;
    hash: CapeHash;
}
