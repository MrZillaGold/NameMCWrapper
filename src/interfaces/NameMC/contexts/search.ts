import * as cheerio from "cheerio";

import { IContextOptions } from "./context";
import { PlayerContext, ServerContext, SkinContext } from "../../../contexts";

export interface ISearchContextOptions extends IContextOptions {
    data?: string | cheerio.Element | cheerio.Element[];
}

export enum NameStatus {
    AVAILABLE = "available",
    AVAILABLE_LATER = "available_later",
    UNAVAILABLE = "unavailable",
    INVALID = "invalid"
}

export type NameStatusUnion = "available" | "unavailable" | "invalid" | "available_later";

export interface ISearchContext {
    /**
     * Search Query
     */
    query: string;
    /**
     * Query name info
     */
    name: {
        /**
         * Name status
         */
        status: NameStatus | NameStatusUnion;
        /**
         * Name availability timestamp
         */
        availabilityTime: number | null;
        /**
         * Name availability time
         */
        availabilityAt: string | null;
        /**
         * Name searches
         */
        searches: number;
    };
    /**
     * Query players
     */
    players: PlayerContext[];
    /**
     * Query servers
     */
    servers: ServerContext[];
    /**
     * Query skin tag
     */
    skin: SkinContext | null;
}
