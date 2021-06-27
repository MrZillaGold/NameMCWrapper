import * as cheerio from "cheerio";

import { CapeContext, PlayerContext, ServerContext, SkinContext } from "../../../contexts";
import { IContextOptions } from "./context";
import { IFriend } from "../../API";

export interface IPlayerContextOptions extends IContextOptions {
    data?: string | cheerio.Element | cheerio.Element[];
    isSearch?: boolean;
}

export interface IPlayerContext {
    /**
     * Profile ID
     */
    id: number;
    /**
     * Player uuid
     */
    uuid: string;
    /**
     * Player username
     */
    username: string;
    /**
     * Profile views
     */
    views: number;
    /**
     * Profile short url
     */
    url: string;
    /**
     * Skin history
     */
    skins: SkinContext[];
    /**
     * Player capes
     */
    capes: CapeContext[];
    /**
     * Player friends
     */
    friends: IFriend[];
    /**
     * Nickname history
     */
    names: IUsername[];
    /**
     * Player favorite servers
     */
    servers: ServerContext[];
    /**
     * Player followers
     */
    followers: PlayerContext[];
    /**
     * Player following
     */
    following: PlayerContext[];
    /**
     * Following date, available when receiving player followers/following
     */
    followingDate: number;
    /**
     * Badlion Client statistics
     *
     * @see {@link https://www.badlion.net/forum/thread/309559 | Announce from Badlion Client}
     */
    badlion: IBadlion | null;
}

export interface IBadlion {
    /**
     * Total time spent in the game
     */
    play_time: number;
    /**
     * Login streak
     */
    login_streak: {
        /**
         * Current value
         */
        current: number;
        /**
         * Max value
         */
        max: number;
    };
    /**
     * Last game server
     */
    last_server: string;
    /**
     * Last online
     */
    last_online: number;
    /**
     * Used game version
     */
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
