import { Username } from '../player';

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
