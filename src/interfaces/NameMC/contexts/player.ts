import * as cheerio from "cheerio";

import { CapeContext, ServerContext, SkinContext } from "../../../contexts";
import { IContextOptions } from "./context";
import { IFriend } from "../../API";
import Element = cheerio.Element;

export interface IPlayerContextOptions extends IContextOptions {
    data?: string | Element | Element[];
}

export interface IPlayerContext {
    uuid: string;
    username: string;
    views: number;
    url: string;
    skins: SkinContext[];
    capes: CapeContext[];
    friends: IFriend[];
    names: INickname[];
    servers: ServerContext[];
    badlion: IBadlion | null;
}

export interface IBadlion {
    play_time: number;
    login_streak: {
        current: number;
        max: number;
    };
    last_server: string;
    last_online: number;
    version: string;
}

export type Nickname = string;

export interface INickname {
    nickname: Nickname;
    changed_at: string | null;
    timestamp: number | null;
}
