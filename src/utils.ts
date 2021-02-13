import { AxiosError, AxiosInstance } from "axios";

import { WrapperError } from "./WrapperError";

import { CapesMap, Nickname } from "./interfaces";
import TagElement = cheerio.TagElement;
import Element = cheerio.Element;

export const nameRegExp: RegExp = /^(?:(?<name>[A-Za-z0-9_]{1,16})|(?<uuid>[0-9a-f]{8}-?[0-9a-f]{4}-?[0-5][0-9a-f]{3}-?[089ab][0-9a-f]{3}-?[0-9a-f]{12}))$/;
export const profileRegExp: RegExp = /[^]+\/profile\/[^]+/;
export const profileSkinsRegExp: RegExp = /\/minecraft-skins\/profile\/([^]+)/;
export const skinRegExp: RegExp = /[^]+\/skin\/([^]+)/;

export const capes: CapesMap = new Map([
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

export enum Color {
    BLACK = "000000",
    DARK_BLUE = "0000AA",
    DARK_GREEN = "00AA00",
    DARK_AQUA = "00AAAA",
    DARK_RED = "AA0000",
    DARK_PURPLE = "AA00AA",
    GOLD = "FFAA00",
    GRAY = "AAAAAA",
    DARK_GRAY = "AAAAAA",
    BLUE = "5555FF",
    GREEN = "55FF55",
    AQUA = "55FFFF",
    RED = "FF5555",
    LIGHT_PURPLE = "FF55FF",
    YELLOW = "FFFF55",
    WHITE = "FFFFFF",
    RESET = "AAAAAA"
}

export enum Style {
    BOLD = "font-weight: bold;",
    UNDERLINED = "text-decoration: underline;",
    STRIKETHROUGH = "text-decoration: line-through;",
    ITALIC = "font-style: italic;"
}

export function getUUID(client: AxiosInstance, endpoint: string, nickname: string): Promise<Nickname> {
    return new Promise(async (resolve, reject) => {
        const isNickname = nickname.match(nameRegExp);

        if (isNickname) {
            const uuid: string = isNickname.groups?.uuid ?? await client.get(`${endpoint}/mojang/v2/user/${nickname}`)
                .then(({ data: { uuid } }) => uuid)
                .catch((error: AxiosError) => {
                    reject(
                        error?.response?.status === 404 ?
                            new WrapperError(3, [nickname])
                            :
                            error
                    );
                });

            resolve(uuid);
        }

        reject(
            new WrapperError(2)
        );
    });
}


export function escapeColorsClasses(elements: TagElement[]): any[] {
    return elements.map((element: TagElement) => {
        if (element.children && element.children.length !== 1) {
            return escapeColorsClasses(element.children as TagElement[]);
        }

        if (element.attribs?.class) {
            element.attribs.style = element.attribs.class.split(" ")
                .map((style: string) => {
                    style = style.replace("mc-", "")
                        .replace("-", "_");

                    switch (style) {
                        case "bold":
                        case "underlined":
                        case "strikethrough":
                        case "italic":
                            return Style[style as keyof typeof Style];
                        default:
                            return `color: #${Color[style.toUpperCase() as keyof typeof Color]};`;
                    }
                })
                .join("");

            delete element.attribs.class;
        }

        return element;
    })
        .flat(Infinity);
}

export function escapeHtml(elements: Element[]): string {
    return elements.map((element: Element) => {
        if (element.type !== "text") {
            return escapeHtml((element as TagElement).children);
        }

        return element.data;
    })
        .join("");
}
