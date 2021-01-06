import { Hash } from "./skin";

export type CapeType = "minecraft" | "optifine";
export type CapeName = "MineCon 2016" | "MineCon 2015" | "MineCon 2013" | "MineCon 2012" | "MineCon 2011" | "Realms Mapmaker" | "Mojang" | "Translator" | "Mojira Moderator" | "Cobalt" | "Mojang (Classic)" | "Scrolls" | "Translator (Chinese)" | "cheapsh0t" | "dannyBstyle" | "JulianClark" | "Millionth Customer" | "MrMessiah" | "Prismarine" | "Turtle" | "Optifine";

export type CapesMap = Map<string, CapeName>;

export interface ICapeInfo {
    type: CapeType;
    name: CapeName;
}

export interface ICape extends ICapeInfo {
    url: string;
    hash: Hash;
}
