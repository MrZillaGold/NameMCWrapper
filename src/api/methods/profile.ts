import { Username } from '../../contexts';

export interface IFriend {
    /**
     * Player uuid
     */
    uuid: string;
    /**
     * Player nickname
     */
    name: Username;
}
