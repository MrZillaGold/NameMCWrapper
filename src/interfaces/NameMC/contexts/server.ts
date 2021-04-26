import * as cheerio from "cheerio";

import { IContextOptions } from "./context";
import { Nickname } from "./player";
import Element = cheerio.Element;

export interface IServerContextOptions extends IContextOptions {
    data?: string | Element | Element[];
    extended?: boolean;
}

export interface IServerContext {
    ip: string;
    title: string;
    icon: string;
    motd: {
        clear: string;
        html: string;
    };
    players: {
        online: number;
        max: number;
    };
    country: {
        name: string;
        image: string;
        emoji: string;
    } | null;
    rating: number;
    version: string | null;
    uptime: number | null;
}

export interface ICheckServerLikeOptions {
    ip: string;
    nickname: Nickname;
}
