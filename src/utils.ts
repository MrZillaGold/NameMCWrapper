// @ts-ignore
import * as dateParser from "any-date-parser";
import { AxiosError, AxiosInstance } from "axios";

import { WrapperError } from "./WrapperError";

import { Nickname } from "./interfaces";
import TagElement = cheerio.TagElement;
import Element = cheerio.Element;

export const steveSkinHash = "12b92a9206470fe2";

export const nameRegExp = /^(?:(?<name>[A-Za-z0-9_]{1,16})|(?<uuid>[0-9a-f]{8}-?[0-9a-f]{4}-?[0-5][0-9a-f]{3}-?[089ab][0-9a-f]{3}-?[0-9a-f]{12}))$/;
export const profileRegExp = /[^]+\/profile\/[^]+/;
export const profileSkinsRegExp = /\/minecraft-skins\/profile\/([^]+)/;
export const skinRegExp = /(?:[^]+)?\/skin\/([^]+)/;

export const kSerializeData = Symbol("serializeData");

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
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const isNickname = nickname.match(nameRegExp);

        if (!isNickname) {
            return reject(
                new WrapperError("INVALID_NICKNAME", nickname)
            );
        }

        const uuid: string = isNickname.groups?.uuid ?? await client.get(`${endpoint}/mojang/v1/user/${nickname}`)
            .then(({ data: { uuid } }) => uuid)
            .catch((error: AxiosError) => {
                reject(
                    error?.response?.status === 404 ?
                        new WrapperError("NOT_FOUND", nickname)
                        :
                        error
                );
            });

        resolve(uuid);
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

export function parseDate(humanizedDate: string): number {
    // @ts-ignore
    const ParsedDate = Date.bind(null, ...Object.values(dateParser.attempt(humanizedDate, "en-US")));

    // @ts-ignore
    return new ParsedDate()
        .getTime() || 0;
}

export function applyPayload<T, P>(context: T, payload: P): void {
    Object.entries(payload).forEach(([key, value]) => {
        (context as any)[key as unknown as keyof P] = value;
    });
}

export const pickProperties = <T, K extends keyof T>(params: T, properties: K[]): Pick<T, K> => {
    const copies = {} as Pick<T, K>;

    for (const property of properties) {
        copies[property] = params[property];
    }

    return copies;
};
