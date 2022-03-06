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
