import * as cheerio from "cheerio";

import { CapeContext, PlayerContext, ServerContext, SkinContext } from "../../../contexts";
import { IContextOptions } from "./context";
import { IFriend } from "../../API";

export interface IPlayerContextOptions extends IContextOptions {
    data?: string | cheerio.Element | cheerio.Element[];
}

export interface IPlayerContext {
    id: number;
    uuid: string;
    username: string;
    views: number;
    url: string;
    skins: SkinContext[];
    capes: CapeContext[];
    friends: IFriend[];
    names: IUsername[];
    servers: ServerContext[];
    followers: PlayerContext[];
    following: PlayerContext[];
    followingDate: number;
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

export type Username = string;

export interface IUsername {
    username: Username;
    changed_at: string | null;
    timestamp: number | null;
}

export enum Sort {
    ASC = "asc",
    DESC = "desc"
}

export type SortUnion = "asc" | "desc";

export type FollowersSort = Partial<Record<"profile" | "date" | "following", Sort | SortUnion>>;

export interface IGetFollowersOptions {
    /**
     * Sort filter
     */
    sort?: FollowersSort;
    /**
     * Page number
     */
    page?: number;
}

/**
 * @hidden
 */
export enum FollowersSection {
    FOLLOWING = "following",
    FOLLOWERS = "followers"
}

/**
 * @hidden
 */
export type FollowersSectionUnion = "following" | "followers";

/**
 * @hidden
 */
export interface ILoadFollowersOptions extends IGetFollowersOptions {
    section: FollowersSection | FollowersSectionUnion;
}
