import { Username } from "./contexts";

export interface IGetSkinHistoryOptions {
    /**
     * Player username
     */
    username: Username;
    /**
     * Page
     */
    page?: number;
}

export type Tab = "trending" | "new" | "random" | "tag";
export type Section = "daily" | "weekly" | "monthly" | "top" | string | undefined;

export interface IGetSkinsOptions<T extends string, S extends string | undefined = undefined, P extends number | undefined = undefined> {
    /**
     * Tab
     */
    tab?: T;
    /**
     * Section
     */
    section?: S;
    /**
     * Page
     */
    page?: P;
}
