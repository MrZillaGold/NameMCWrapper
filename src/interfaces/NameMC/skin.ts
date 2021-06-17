import { Username } from "./contexts";

export interface IGetSkinHistoryOptions {
    username: Username;
    page?: number;
}

export type Tab = "trending" | "new" | "random" | "tag";
export type Section = "daily" | "weekly" | "monthly" | "top" | string | undefined;

export interface IGetSkinsOptions<T extends string, S extends string | undefined = undefined, P extends number | undefined = undefined> {
    tab?: T;
    section?: S;
    page?: P;
}
