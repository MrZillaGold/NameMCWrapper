import * as cheerio from "cheerio";

import { Context } from "./context";
import { SkinContext } from "./skin";
import { PlayerContext } from "./player";

import { kSerializeData, pickProperties } from "../utils";

import { ISearchContext, ISearchContextOptions, NameStatus } from "../interfaces";
import { ServerContext } from "./server";

export class SearchContext extends Context<ISearchContext> implements ISearchContext {

    /**
     * Search Query
     */
    readonly query: ISearchContext["query"] = "";
    /**
     * Query name info
     */
    readonly name: ISearchContext["name"] = {
        /**
         * Name status
         */
        status: NameStatus.INVALID,
        /**
         * Name availability timestamp
         */
        availabilityTime: null,
        /**
         * Name availability time
         */
        availabilityAt: null,
        /**
         * Name searches
         */
        searches: 0
    };
    /**
     * Query players
     */
    readonly players: ISearchContext["players"] = [];
    /**
     * Query servers
     */
    readonly servers: ISearchContext["servers"] = [];
    /**
     * Query skin tag
     */
    readonly skin: ISearchContext["skin"] = null;

    constructor({ data, ...options }: ISearchContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data);

        const [skinTagCol, mainCol] = $("main > div > div.col-12")
            .map((index, element) => cheerio.load(element))
            .get();

        const skin = skinTagCol("div.card-body")
            .get(0);

        if (skin) {
            this.skin = new SkinContext({
                ...this,
                data: skin
            });
        }

        mainCol("div:not(.ad-container) > div.card")
            .get()
            .forEach((element) => {
                const $ = cheerio.load(element);

                const statusBar = $("div#status-bar");

                if (statusBar.length) {
                    this.name.status = statusBar.hasClass("bg-success") ?
                        NameStatus.AVAILABLE
                        :
                        statusBar.hasClass("bg-info") ?
                            NameStatus.AVAILABLE_LATER
                            :
                            statusBar.hasClass("bg-warning") ?
                                NameStatus.UNAVAILABLE
                                :
                                NameStatus.INVALID;

                    const availabilityTime = statusBar.find("time");

                    if (availabilityTime.length) {
                        this.name.availabilityAt = availabilityTime.attr()
                            .datetime;
                        this.name.availabilityTime = new Date(this.name.availabilityAt)
                            .getTime();
                    }

                    this.name.searches = parseInt(
                        statusBar.find("div.tabular")
                            .text()
                    );

                    return;
                }

                const servers = $("tr");

                if (servers.length) {
                    this.servers.push(
                        ...servers.map((index, element) => (
                            new ServerContext({
                                ...this,
                                data: element,
                                isSearch: true
                            })
                        ))
                            .get()
                    );

                    return;
                }

                this.players.push(
                    new PlayerContext({
                        ...this,
                        data: $("div.card").get(0),
                        isSearch: true
                    })
                );
            });
    }

    /**
     * Check is query name is available
     */
    get isAvailable(): boolean {
        return this.name.status === NameStatus.AVAILABLE;
    }

    /**
     * Check is query name is available available later
     */
    isAvailableLater(): boolean {
        return this.name.status === NameStatus.AVAILABLE_LATER;
    }

    /**
     * Check is query name is unavailable
     */
    get isUnavailable(): boolean {
        return this.name.status === NameStatus.UNAVAILABLE;
    }

    /**
     * Check is query name is invalid
     */
    get isInvalid(): boolean {
        return this.name.status === NameStatus.INVALID;
    }

    /**
     * Check query has players
     */
    get hasPlayers(): boolean {
        return Boolean(
            this.players.length
        );
    }

    /**
     * Check query has servers
     */
    get hasServers(): boolean {
        return Boolean(
            this.servers.length
        );
    }

    /**
     * Check query has skin tag name
     */
    get hasSkinTag(): boolean {
        return Boolean(
            this.skin
        );
    }

    /**
     * @hidden
     */
    [kSerializeData](): ISearchContext {
        return pickProperties(this, [
            "query",
            "name",
            "players",
            "servers",
            "skin"
        ]);
    }
}
