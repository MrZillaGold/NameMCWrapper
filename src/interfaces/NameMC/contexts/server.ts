import * as cheerio from "cheerio";

import { IContextOptions } from "./context";
import { Username } from "./player";

export interface IServerContextOptions extends IContextOptions {
    data?: string | cheerio.Element | cheerio.Element[];
    extended?: boolean;
    isSearch?: boolean;
}

export interface IServerContext {
    /**
     * Server ip
     */
    ip: string;
    /**
     * Server title
     */
    title: string;
    /**
     * Server icon url
     */
    icon: string;
    /**
     * Server motd
     */
    motd: {
        /**
         * Plaint text
         */
        clear: string;
        /**
         * HTML Formatted string
         */
        html: string;
    };
    /**
     * Server current players stats
     */
    players: {
        /**
         * Current online
         */
        online: number;
        /**
         * Max online
         */
        max: number;
    };
    /**
     * Server country
     */
    country: {
        /**
         * Country name
         */
        name: string;
        /**
         * Country SVG Emoji image
         */
        image: string;
        /**
         * Country Emoji
         */
        emoji: string;
    } | null;
    /**
     * Server rating
     */
    rating: number;
    /**
     * Server version
     */
    version: string | null;
    /**
     * Server uptime
     */
    uptime: number | null;
}

export interface ICheckServerLikeOptions {
    /**
     * Server IP
     */
    ip: string;
    /**
     * Player username
     */
    username: Username;
}
