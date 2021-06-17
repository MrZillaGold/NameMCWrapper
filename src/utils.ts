import * as axios from "axios";
import { Element } from "cheerio";

import { WrapperError } from "./WrapperError";

import { Username } from "./interfaces";
import AxiosError = axios.AxiosError;
import AxiosResponse = axios.AxiosResponse;

export const steveSkinHash = "12b92a9206470fe2";

export const nameRegExp = /^(?:(?<name>[A-Za-z0-9_]{1,16})|(?<uuid>[0-9a-f]{8}-?[0-9a-f]{4}-?[0-5][0-9a-f]{3}-?[089ab][0-9a-f]{3}-?[0-9a-f]{12}))$/;
export const profileRegExp = /[^]+\/profile\/[^]+/;
export const profileSkinsRegExp = /\/minecraft-skins\/profile\/([^]+)/;
export const skinRegExp = /(?:[^]+)?\/skin\/([^]+)/;
export const serverRegExp = /(?:[^]+)?\/server\/([^]+)/;

export const kSerializeData = Symbol("serializeData");

/**
 * Minecraft HEX colors
 */
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

/**
 * Minecraft formatting css styles
 */
export enum Style {
    BOLD = "font-weight: bold;",
    UNDERLINED = "text-decoration: underline;",
    STRIKETHROUGH = "text-decoration: line-through;",
    ITALIC = "font-style: italic;"
}

export async function getUUID(endpoint: string, username: string): Promise<Username> {
    const isNickname = username.match(nameRegExp);

    if (!isNickname) {
        throw new WrapperError("INVALID_NICKNAME", username);
    }
    
    // @ts-ignore
    // eslint-disable-next-line no-return-await
    return isNickname.groups?.uuid ?? await axios.get(`${endpoint}/mojang/v1/user/${username}`)
        .then(({ data: { uuid } }: AxiosResponse) => uuid as string)
        .catch((error: AxiosError) => {
            throw error?.response?.status === 404 ?
                new WrapperError("NOT_FOUND", username)
                :
                error;
        });
}

export function escapeColorsClasses(elements: Element[]): any[] {
    return elements.map((element) => {
        if (element.children && element.children.length !== 1) {
            return escapeColorsClasses(element.children as Element[]);
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
            return escapeHtml(element.children as Element[]);
        }

        // @ts-ignore
        return element.data;
    })
        .join("");
}

export function parseDuration(duration: string): number {
    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;

    const offset = [minute, hour, day];

    return duration.split(" ")
        .reverse()
        .reduce((acc, rawValue, index) => {
            const value = Number(rawValue.replace(/[^\d]+/g, ""));

            acc += value * offset[index];

            return acc;
        }, 0);
}

export function applyPayload<T, P>(context: T, payload: P): void {
    Object.entries(payload).forEach(([key, value]) => {
        (context as any)[key as unknown as keyof P] = value;
    });
}

export function pickProperties<T, K extends keyof T>(params: T, properties: K[]): Pick<T, K> {
    const copies = {} as Pick<T, K>;

    for (const property of properties) {
        copies[property] = params[property];
    }

    return copies;
}

export function convertDate(fullDate: string): number {
    const [date, time] = fullDate.split(", ");

    const ISODate = date
        .split(".")
        .reverse()
        .join("-");

    return new Date(`${ISODate}T${time}`)
        .getTime();
}
