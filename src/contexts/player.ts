import cheerio, { Node, Element, Cheerio, CheerioAPI } from 'cheerio';

import { WrapperError } from '../error';
import { Context, SkinContext, CapeContext, ServerContext, IContextOptions, Model } from './';

import { kSerializeData, serverRegExp, pickProperties, convertDate, nameRegExp, profileRegExp } from '../utils';
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
     * Payload loaded
     * @hidden
     */
    #extended = false;

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

        this.skins = this.#parseSkins($, isSearch);

        if (isSearch) {
            this.names = this.#parseUsernameHistory(
                $('tr')
            );
        } else {
            this.capes = this.#parseCapes($);
            this.servers = this.#parseServers($);

            const { uuid, views, names } = this.#parseInfoColumns($);

            this.uuid = uuid;
            this.views = views;
            this.names = names;
        }

        this.username = this.names[this.names.length - 1].username;
        this.id = this.#parseId($, isSearch);
    }

    /**
     * Check payload loaded
     */
    get isExtended(): boolean {
        return this.#extended;
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

        if (!(this.username && this.uuid && this.id)) {
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

        this.#extended = true;
    }

    /**
     * Get player followers
     */
    getFollowers(options: IGetFollowersOptions): Promise<PlayerContext['followers']> {
        return this.#loadFollowers({
            ...options,
            section: FOLLOWERS
        });
    }

    /**
     * Get player following
     */
    getFollowing(options: IGetFollowersOptions): Promise<PlayerContext['followers']> {
        return this.#loadFollowers({
            ...options,
            section: FOLLOWING
        });
    }

    /**
     * @hidden
     */
    async #loadFollowers({ section, page = 1, sort = {} }: ILoadFollowersOptions): Promise<PlayerContext['followers']> {
        if (!this.#extended) {
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
                this.#parseFollowers(data)
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
    #parseFollowers(data: string): PlayerContext['followers'] {
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
    #parseUsernameHistory(element: Cheerio<Element>): PlayerContext['names'] {
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
    #parseServers($: CheerioAPI): PlayerContext['servers'] {
        return $('a > img.server-icon')
            .map((index, element) => {
                const ip = (element.parent as Element)?.attribs?.href
                    .replace(serverRegExp, '$1');

                const title = (element.next as Text | null)?.data || '';
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
    }

    /**
     * @hidden
     */
    #parseCapes($: CheerioAPI): PlayerContext['capes'] {
        return $('canvas.cape-2d')
            .map((index, { attribs: { 'data-cape': hash } }) => (
                new CapeContext({
                    ...this,
                    hash
                })
            ))
            .get();
    }

    /**
     * @hidden
     */
    #parseSkins($: CheerioAPI, isSearch?: boolean): PlayerContext['skins'] {
        return $(isSearch ? 'img.skin-2d' : 'canvas.skin-2d.skin-button')
            .map((index, { attribs: { 'data-id': hash, 'data-model': model = Model.UNKNOWN, title, src } }) => (
                new SkinContext({
                    ...this,
                    payload: isSearch ?
                        SkinContext.parseSkinLink(src)
                        :
                        {
                            model,
                            id: hash,
                            createdAt: convertDate(title)
                        }
                })
            ))
            .get();
    }

    /**
     * @hidden
     */
    #parseInfoColumns($: CheerioAPI): Pick<PlayerContext, 'uuid' | 'views' | 'names'> {
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
                    const views = parseInt(
                        $('div.col-auto')
                            .text()
                    );

                    return Number(views);
                }
            }
        })
            .get() as [string, string, number];

        const names = this.#parseUsernameHistory(usernameHistoryRaw);

        const [uuid, , views] = baseInfo;

        return {
            uuid,
            views,
            names
        };
    }

    #parseId($: CheerioAPI, isSearch?: boolean): number {
        if (isSearch) {
            const { attribs: { href } } = $('div.card-header a')
                .get(0);

            const match = href.match(profileRegExp);

            if (!match) {
                return 0;
            }

            const [,, id] = match;

            return Number(id) || 0;
        }

        const { attribs: { href } } = $(`a[href^="/profile/${this.username}"].nav-link`)
            .get(0);

        return Number(href.split('.').pop()) || 0;
    }

    /**
     * @hidden
     */
    [kSerializeData](): any {
        return pickProperties(this, [
            'id',
            'uuid',
            'username',
            'views',
            'names',
            'skins',
            'capes',
            'friends',
            'followers',
            'following',
            'followingDate',
            'servers'
        ]);
    }
}
