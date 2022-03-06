import * as cheerio from 'cheerio';

import { Context, IContextOptions } from './context';
import { SkinContext } from './skin';
import { PlayerContext } from './player';
import { ServerContext } from './server';

import { kSerializeData, pickProperties } from '../utils';
import { CheerioAPI } from 'cheerio';

export interface ISearchContextOptions extends IContextOptions {
    data?: string | cheerio.Element | cheerio.Element[];
}

/**
 * NameMC Search Name Status
 */
export enum NameStatus {
    AVAILABLE = 'available',
    AVAILABLE_LATER = 'available_later',
    UNAVAILABLE = 'unavailable',
    INVALID = 'invalid'
}
export type NameStatusUnion = `${NameStatus}`;

export class SearchContext extends Context<SearchContext> {

    /**
     * Search Query
     */
    readonly query: string = '';
    /**
     * Query name info
     */
    readonly name = {
        /**
         * Name status
         */
        status: NameStatus.INVALID as NameStatus | NameStatusUnion,
        /**
         * Name availability timestamp
         */
        availabilityTime: null as null | number,
        /**
         * Name availability time
         */
        availabilityAt: null as null | number,
        /**
         * Name searches
         */
        searches: 0
    };
    /**
     * Query players
     */
    readonly players: PlayerContext[] = [];
    /**
     * Query servers
     */
    readonly servers: ServerContext[] = [];
    /**
     * Query skin tag
     */
    readonly skin: SkinContext | null = null;

    /**
     * @hidden
     */
    constructor({ data, ...options }: ISearchContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data);

        const [skinTagCol, mainCol] = $('main > div > div.col-12')
            .map((index, element) => cheerio.load(element))
            .get();

        const hasMainCol = Boolean(mainCol);

        if (hasMainCol) {
            const skin = skinTagCol('div.card-body')
                .get(0);

            if (skin) {
                this.skin = new SkinContext({
                    ...this,
                    data: skin
                });
            }
        }

        (hasMainCol ? mainCol : skinTagCol)('div.card.mb-3, div:not(.ad-container).mb-3')
            .get()
            .forEach((element) => {
                const $ = cheerio.load(element);

                const hasStatusBar = this.#parseStatusBar($);

                if (hasStatusBar) {
                    return;
                }

                const hasServers = this.#parseServers($);

                if (hasServers) {
                    return;
                }

                this.#parsePlayers($);
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
    get isAvailableLater(): boolean {
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
    [kSerializeData](): any {
        return pickProperties(this, [
            'query',
            'name',
            'players',
            'servers',
            'skin'
        ]);
    }

    /**
     * @hidden
     */
    #parseStatusBar($: CheerioAPI): boolean {
        const statusBar = $('div#status-bar');

        if (statusBar.length) {
            this.name.status = statusBar.hasClass('bg-success') ?
                NameStatus.AVAILABLE
                :
                statusBar.hasClass('bg-info') ?
                    NameStatus.AVAILABLE_LATER
                    :
                    statusBar.hasClass('bg-warning') ?
                        NameStatus.UNAVAILABLE
                        :
                        NameStatus.INVALID;

            const availabilityTime = statusBar.find('time');

            if (availabilityTime.length) {
                this.name.availabilityAt = Number(
                    availabilityTime.attr()
                        .datetime
                );
                this.name.availabilityTime = new Date(this.name.availabilityAt)
                    .getTime();
            }

            this.name.searches = parseInt(
                statusBar.find('div.tabular')
                    .text()
            );

            return true;
        }

        return false;
    }

    /**
     * @hidden
     */
    #parseServers($: CheerioAPI): boolean {
        const servers = $('div.table-responsive tr');

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

            return true;
        }

        return false;
    }

    /**
     * @hidden
     */
    #parsePlayers($: CheerioAPI): void {
        const data = $('div.card')
            .get(0);

        this.players.push(
            new PlayerContext({
                ...this,
                data,
                isSearch: true
            })
        );
    }
}
