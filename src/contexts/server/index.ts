import cheerio, { CheerioAPI, Element } from 'cheerio';

import { Context, IContextOptions } from '../context';
import { WrapperError } from '../../error';

import { escapeColorsClasses, escapeHtml, getUUID, kSerializeData, pickProperties } from '../../utils';

import { ICheckServerLikeOptions } from './types';

export interface IServerContextOptions extends IContextOptions {
    data?: string | Element | Element[];
    extended?: boolean;
    isSearch?: boolean;
}

export class ServerContext extends Context<ServerContext> {

    /**
     * Server ip
     */
    readonly ip: string = '';
    /**
     * Server title
     */
    readonly title: string = '';
    /**
     * Server icon url
     */
    readonly icon: string = '';
    /**
     * Server motd
     */
    readonly motd = {
        clear: '',
        html: ''
    };
    /**
     * Server current players stats
     */
    readonly players = {
        /**
         * Online now
         */
        online: 0,
        /**
         * Maximum online
         */
        max: 0
    };
    /**
     * Server country
     */
    readonly country: {
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
    } | null = null;
    /**
     * Server rating
     */
    readonly rating: number = 0;
    /**
     * Server version
     */
    readonly version: string | null = null;
    /**
     * Server uptime
     */
    readonly uptime: number | null = null;

    /**
     * Payload loaded
     * @hidden
     */
    #extended = false;

    /**
     * @hidden
     */
    constructor({ data, extended, isSearch, ...options }: IServerContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data);

        if (isSearch) {
            this.payload.players = {};

            this.#parseSearchTableRow($);

            this.setupPayload();

            return;
        }

        const serverCard = extended ?
            this.#parseServerCard(
                $('div.card.mb-3')
                    .filter((index, element) => element?.attribs?.style?.includes('#0F0F0F'))
                    .get(0),
                !extended
            )
            :
            this.#parseServerCard(data as Element, !extended);

        if (extended) {
            this.#extended = extended;

            const [, infoCard] = $('div.row > div.col-12.col-lg-5')
                .children()
                .filter('div.card.mb-3')
                .get()
                .map((element) => {
                    const $ = cheerio.load(element);

                    return $('div.card.mb-3 > div.card-body')
                        .children();
                });

            const { version = null, uptime = null, country = null } = Object.assign.apply(
                {},
                [{}, ...infoCard.map((index, element) => {
                    const $ = cheerio.load(element);

                    const rowValue = $('div.row > div.text-right');

                    if (rowValue.children().length) {
                        return {
                            country: this.#parseServerCountry(
                                rowValue.children('img')
                                    .get(0)
                            )
                        };
                    }

                    const content = rowValue.contents()
                        .get(0) // @ts-ignore
                        .data;

                    const isUptime = content.endsWith('%');

                    return {
                        [isUptime ? 'uptime' : 'version']: content ?
                            isUptime ?
                                parseFloat(content)
                                :
                                content
                            :
                            null
                    };
                })
                    .get()
                ]
            );

            this.payload = {
                version,
                country,
                uptime
            };

            this.setupPayload();
        }

        this.payload = serverCard;

        this.setupPayload();
    }

    /**
     * Check payload loaded
     */
    get isExtended(): boolean {
        return this.#extended;
    }

    /**
     * Check like status for player
     */
    async checkLike(username: ICheckServerLikeOptions['username']): Promise<boolean> {
        const endpoint = this.options.getEndpoint({ domain: 'api.ashcon.app' });
        const uuid = await getUUID(endpoint, username);

        return this.api.server.likes({
            target: this.ip,
            profile: uuid
        });
    }

    /**
     * Load all server information
     */
    async loadPayload(): Promise<void> {
        if (this.isExtended) {
            return;
        }

        this.payload = await this.client.get(`/server/${this.ip}`)
            .then(({ data }) => new ServerContext({
                ...this,
                data,
                extended: true,
                payload: {
                    ip: this.ip
                }
            }));

        this.setupPayload();

        this.#extended = true;
    }

    /**
     * @hidden
     */
    #parseServerCard(data: Element, isPreview: boolean): Partial<
        Pick<ServerContext,
            'ip'
            | 'title'
            | 'country'
            | 'motd'
            | 'players'
            | 'rating'
            | 'icon'
            >
        > {
        const $ = cheerio.load(data);

        const header = $('div.card-header.p-0 > div.row.no-gutters');
        const [{ data: title }] = header.find(`div.col.text-center.text-nowrap.text-ellipsis.mc-bold${isPreview ? '.p-1' : '.p-2.mc-white'}`)
            .get(0)
            .children as unknown as Text[];
        const [{ data: rating }] = header.find(`div.col-auto.mc-gray${isPreview ? '.p-1' : '.p-2'}`)
            .get(1)
            .children as unknown as Text[];

        const body = $('div.card-body.p-0 > div.row.no-gutters.flex-nowrap.align-items-center');

        const { src: icon } = body.find(`div.col-auto${isPreview ? '.p-1' : '.p-2'} > img`)
            .attr();

        const bodyMotd = body.find(`div.col.mc-reset${isPreview ? '.p-1' : '.p-2'}`)
            .children();

        if (!bodyMotd.children()[0]?.attribs?.class?.includes('float-right') && !bodyMotd.children()[0]?.next) {
            throw new WrapperError('SERVER_OFFLINE', title);
        }

        const motdTitle = bodyMotd
            .attr()
            .title;
        // @ts-ignore
        const [{ children: [{ data: onlinePlayers }, , { data: maxPlayers }], next: bodyMotdNext = { data: '' } }, rawMotd] = bodyMotd.children()
            .get();

        const { data: textMotd } = bodyMotdNext as Text;

        const motdHtml = typeof rawMotd === 'object' ?
            cheerio.load(escapeColorsClasses(rawMotd.children as Element[]))
                .html()
            :
            textMotd;
        const motdClear = isPreview ?
            motdTitle
            :
            typeof rawMotd === 'object' ?
                escapeHtml(rawMotd.children as Element[])
                :
                textMotd;

        const parsedData = {
            icon,
            title: title as string,
            motd: {
                clear: motdClear as string,
                html: motdHtml as string
            },
            players: {
                online: Number(onlinePlayers),
                max: Number(maxPlayers)
            },
            rating: parseInt(rating)
        };

        if (isPreview) {
            return {
                ...parsedData,
                ip: this.#parseIP(data),
                country: this.#parseServerCountry(
                    header.find('div.col-auto.p-1')
                        .children('img')
                        .get(0)
                )
            };
        }

        return parsedData;
    }

    /**
     * @hidden
     */
    #parseServerCountry(data?: Element): ServerContext['country'] {
        if (data) {
            const { attribs: { title: name, src: image, alt: emoji } } = data;

            return {
                name,
                image,
                emoji
            };
        }

        return null;
    }

    /**
     * @hidden
     */
    #parseIP(data: Element): ServerContext['ip'] {
        return data.attribs.href.replace(/\/[^]+\//, '');
    }

    /**
     * @hidden
     */
    #parseSearchTableRow($: CheerioAPI) {
        $('td')
            .get()
            .forEach((element, index) => {
                const $ = cheerio.load(element);

                const image = $('img');
                const row = $('td');
                const title = $('a');

                switch (index) {
                    case 0:
                        this.payload.icon = image
                            .attr()
                            .src;
                        break;
                    case 1:
                        this.payload.country = this.#parseServerCountry(
                            image.get(0)
                        );
                        break;
                    case 2:
                        this.payload.title = title.text();
                        this.payload.ip = this.#parseIP(title.get(0));
                        break;
                    case 3:
                        this.payload.motd = {
                            clear: row.attr().title,
                            html: ''
                        };
                        break;
                    case 4:
                        this.payload.players.online = Number(row.text());
                        break;
                    case 6:
                        this.payload.players.max = Number(row.text());
                        break;
                    case 7:
                        this.payload.rating = parseInt(row.text());
                        break;
                }
            });
    }

    /**
     * @hidden
     */
    [kSerializeData](): any {
        return pickProperties(this, [
            'ip',
            'title',
            'icon',
            'motd',
            'players',
            'country',
            'rating',
            'version',
            'uptime'
        ]);
    }
}

export * from './types';
