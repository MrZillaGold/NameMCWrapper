import cheerio, { Node, Element, Cheerio } from 'cheerio';

import { WrapperError } from '../error';
import { Context, SkinContext, CapeContext, ServerContext, IContextOptions, Model } from './';

import { kSerializeData, serverRegExp, parseDuration, pickProperties, convertDate, nameRegExp, profileRegExp } from '../utils';
import { IFriend } from '../api';

export interface IPlayerContextOptions extends IContextOptions {
    data?: string | Element | Element[];
    isSearch?: boolean;
}

export type Username = string;
export type Hash = string;

export interface IUsername {
    username: Username;
    changed_at: string | null;
    timestamp: number | null;
}

export enum Sort {
    ASC = 'asc',
    DESC = 'desc'
}
export type SortUnion = `${Sort}`;

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

export type FollowersSort = Partial<Record<'profile' | 'date' | 'following', Sort | SortUnion>>;

/**
 * @hidden
 */
export enum FollowersSection {
    FOLLOWING = 'following',
    FOLLOWERS = 'followers'
}
/**
 * @hidden
 */
export type FollowersSectionUnion = `${FollowersSection}`;

/**
 * @hidden
 */
export interface ILoadFollowersOptions extends IGetFollowersOptions {
    section: FollowersSection | FollowersSectionUnion;
}

const { FOLLOWING, FOLLOWERS } = FollowersSection;

export class PlayerContext extends Context<PlayerContext> {

    /**
     * Profile ID
     */
    readonly id: number = 0;
    /**
     * Player uuid
     */
    readonly uuid: string = '';
    /**
     * Player username
     */
    readonly username: string = '';
    /**
     * Profile short url
     */
    readonly url: string = '';
    /**
     * Profile views
     */
    readonly views: number = 0;
    /**
     * Nickname history
     */
    readonly names: IUsername[] = [];
    /**
     * Skin history
     */
    readonly skins: SkinContext[] = [];
    /**
     * Player capes
     */
    readonly capes: CapeContext[] = [];
    /**
     * Player friends
     */
    readonly friends: IFriend[] = [];
    /**
     * Player favorite servers
     */
    readonly servers: ServerContext[] = [];
    /**
     * Player followers
     */
    readonly followers: PlayerContext[] = [];
    /**
     * Player following
     */
    readonly following: PlayerContext[] = [];
    /**
     * Following date, available when receiving player followers/following
     */
    readonly followingDate: number = 0;
    /**
     * Badlion Client statistics
     *
     * @see {@link https://www.badlion.net/forum/thread/309559 | Announce from Badlion Client}
     */
    readonly badlion: {
        /**
         * Total time spent in the game
         */
        play_time: number;
        /**
         * Login streak
         */
        login_streak: {
            /**
             * Current streak
             */
            current: number;
            /**
             * Max streak
             */
            max: number;
        };
        /**
         * Last login server
         */
        last_server: string;
        /**
         * Last online timestamp
         */
        last_online: number;
        /**
         * Used game version
         */
        version: string;
    } | null = null;

    /**
     * Payload loaded
     * @hidden
     */
    private extended = false;

    /**
     * @hidden
     */
    constructor({ data, isSearch, ...options }: IPlayerContextOptions) {
        super(options);

        this.setupPayload();

        if (!data) {
            return;
        }

        const $ = cheerio.load(data);

        this.skins = $(isSearch ? 'img.skin-2d' : 'canvas.skin-2d.skin-button') // @ts-ignore
            .map((index, { attribs: { 'data-id': hash, 'data-model': model = Model.UNKNOWN, title, src } }) => (
                new SkinContext({
                    ...this,
                    payload: isSearch ?
                        SkinContext.parseSkinLink(src)
                        :
                        {
                            id: hash,
                            model,
                            createdAt: convertDate(title)
                        }
                })
            ))
            .get();

        if (!isSearch) {
            this.capes = $('canvas.cape-2d')
                .map((index, { attribs: { 'data-cape': hash } }) => new CapeContext({
                    ...this,
                    hash
                }))
                .get();

            this.servers = $('a > img.server-icon')
                .map((index, element) => {
                    // @ts-ignore
                    const ip = element.parent?.attribs?.href
                        .replace(serverRegExp, '$1');
                    // @ts-ignore
                    const title = element.next?.data || '';
                    const { attribs: { src: icon } } = element;

                    return new ServerContext({
                        ...this,
                        extended: false,
                        payload: {
                            ip,
                            title,
                            icon
                        }
                    });
                })
                .get();

            const rawBadlionStatistic: any[] = $('div.card.badlion > div.card-body > div.row.no-gutters')
                .get();

            if (rawBadlionStatistic.length === 4) {
                rawBadlionStatistic.splice(1, 0, {
                    current: 0,
                    max: 0
                });
            }

            const badlion: any[] = rawBadlionStatistic.map((element, index) => {
                const $ = cheerio.load(element);

                switch (index) {
                    case 0: {
                        return parseDuration(
                            $('div.col-12')
                                .text()
                        );
                    }
                    case 1: {
                        if (element?.current) {
                            return element;
                        }

                        const [current, max] = $('div.col-12').text()
                            .match(/([\d]+)/g) || [0, 0];

                        return {
                            current: Number(current),
                            max: Number(max)
                        };
                    }
                    case 3: {
                        const time = $('div.col-12 > time').get(0);
                        const lastOnline = time?.attribs?.datetime || null;

                        return lastOnline ?
                            new Date(lastOnline)
                                .getTime()
                            :
                            null;
                    }
                    case 2:
                    case 4: {
                        return $('div.col-12').text();
                    }
                }
            });

            const [baseInfoRaw, usernameHistoryRaw] = $('div.card.mb-3 > div.card-body')
                .map((index, element) => {
                    const $ = cheerio.load(element);

                    const body = $('div.card-body');

                    switch (index) {
                        case 0:
                            return body.children('div.row.no-gutters');
                        case 1:
                            return body.find('tr:not([class])')
                                .map((index, element) => {
                                    element.children.push(element.next as Node);

                                    return element;
                                });
                    }
                })
                .get();

            const baseInfo = baseInfoRaw.map((index, element) => {
                const $ = cheerio.load(element);

                switch (index) {
                    case 0:
                    case 1:
                        return $('div.col-12 > samp')
                            .text();
                    case 2: {
                        const link = $('div.col-12 > a')
                            .text();

                        return `https://${link}`;
                    }
                    case 3: {
                        const views = parseInt(
                            $('div.col-auto')
                                .text()
                        );

                        return Number(views);
                    }
                }
            })
                .get() as [string, string, string, number];

            const usernameHistory = this.parseUsernameHistory(usernameHistoryRaw);

            const [uuid, , url, views] = baseInfo;

            this.id = Number(url.split('.').pop());
            this.uuid = uuid;
            this.url = url;
            this.views = views;
            this.names = usernameHistory;

            if (badlion.length) {
                const [play_time, login_streak, last_server, last_online, version] = badlion;

                this.badlion = {
                    play_time,
                    login_streak,
                    last_server,
                    last_online,
                    version
                };
            }
        } else {
            const [, , id] = $('div.card-header a')
                .get(0)
                .attribs
                .href
                .match(profileRegExp) as RegExpMatchArray;

            this.id = Number(id);
            this.names = this.parseUsernameHistory(
                $('tr')
            );
        }

        this.username = this.names[this.names.length - 1].username;
    }

    /**
     * Check payload loaded
     */
    get isExtended(): boolean {
        return this.extended;
    }

    /**
     * Does the player use Badlion Client
     */
    get usesBadlion(): boolean {
        return Boolean(this.badlion);
    }

    /**
     * Get clean UUID
     */
    get cleanUUID(): string {
        return this.uuid.replace(/-/g, '');
    }

    /**
     * Load all profile information
     */
    async loadPayload(): Promise<void> {
        if (this.isExtended) {
            return;
        }

        if (!(this.username && this.uuid && this.url && this.id)) {
            const username = this.uuid || this.username;

            if (!username.match(nameRegExp)) {
                throw new WrapperError('INVALID_NICKNAME', username);
            }

            await this.client.get<string>(`/profile/${username}`)
                .then(({ request, headers, data }) => {
                    if ((headers['x-final-url'] || request?.res?.responseUrl || request.responseURL).match(profileRegExp)) {
                        this.payload = new PlayerContext({
                            data,
                            ...this
                        })
                            .toJSON();

                        return this.setupPayload();
                    }

                    throw new WrapperError('NOT_FOUND', username);
                });
        }

        this.payload = await this.api.profile.friends({
            target: this.uuid
        })
            .then((friends) => ({
                friends
            }));

        this.setupPayload();

        this.extended = true;
    }

    /**
     * Get player followers
     */
    getFollowers(options: IGetFollowersOptions): Promise<PlayerContext['followers']> {
        return this.loadFollowers({
            ...options,
            section: FOLLOWERS
        });
    }

    /**
     * Get player following
     */
    getFollowing(options: IGetFollowersOptions): Promise<PlayerContext['followers']> {
        return this.loadFollowers({
            ...options,
            section: FOLLOWING
        });
    }

    /**
     * @hidden
     */
    private async loadFollowers({ section, page = 1, sort = {} }: ILoadFollowersOptions): Promise<PlayerContext['followers']> {
        if (!this.extended) {
            await this.loadPayload();
        }

        const filter = Object.entries(sort)
            .map((filter) => filter.join(':'))
            .join(',');

        const loadedFollowers = await this.client.get<string>(`/profile/${this.uuid}/${section}`, {
            params: {
                page,
                sort: filter
            }
        })
            .then(({ data }) => (
                this.parseFollowers(data)
            ));

        const followers = loadedFollowers.reduce<PlayerContext['followers']>((followers, follower) => {
            if (!followers.filter(({ username }) => username === follower.username).length) {
                followers.push(follower);
            }

            return followers;
        }, this[section]);

        this.payload = {
            [section]: followers
        };

        this.setupPayload();

        return loadedFollowers;
    }

    /**
     * @hidden
     */
    private parseFollowers(data: string): PlayerContext['followers'] {
        const $ = cheerio.load(data);

        const uuid = $('tbody > input[name=\'profile\']')
            .map((index, { attribs: { value: uuid } }) => (
                uuid
            ))
            .get();

        const names = $('tbody > tr')
            .map((index, element) => {
                const $ = cheerio.load(element.children);

                const children = $('td');

                const name = cheerio.load(children.get(2));
                const username = name.text();

                // @ts-ignore
                const { attribs: { datetime } } = children.get(3)
                    .firstChild as Node;

                return {
                    username,
                    date: new Date(datetime)
                        .getTime()
                };
            })
            .get();

        return names.map(({ username, date: followingDate }, index) => (
            new PlayerContext({
                ...this,
                payload: {
                    username,
                    followingDate,
                    uuid: uuid[index]
                }
            })
        ));
    }

    /**
     * @hidden
     */
    private parseUsernameHistory(element: Cheerio<Element>): PlayerContext['names'] {
        return element.map((index, element) => {
            const $ = cheerio.load(element);

            const name = $('a').get(0);
            const time = $('time').get(0);

            if (name) {
                // @ts-ignore
                const { children: [{ data: username }] } = name;
                const changed_at = time?.attribs?.datetime || null;

                return {
                    username,
                    changed_at,
                    timestamp: changed_at ?
                        new Date(changed_at)
                            .getTime()
                        :
                        null
                };
            }
        })
            .get()
            .reverse();
    }

    /**
     * @hidden
     */
    [kSerializeData](): any {
        return pickProperties(this, [
            'id',
            'uuid',
            'username',
            'url',
            'views',
            'names',
            'skins',
            'capes',
            'friends',
            'followers',
            'following',
            'followingDate',
            'badlion',
            'servers'
        ]);
    }
}
