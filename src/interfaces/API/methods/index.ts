import { IFriend } from "./profile";
import { IServerLikesParams } from "./server";

export interface IMethods {
    /**
     * Profile API section methods
     */
    profile: {
        /**
         * Get player friends
         */
        friends(params: IParams): Promise<IFriend[]>;
    };
    /**
     * Server API section methods
     */
    server: {
        /**
         * Check player server like
         */
        likes(params: IParams): Promise<string[]>;
        /**
         * Get all players list server likes
         */
        likes(params: IServerLikesParams): Promise<boolean>;
    };
}

export interface IParams {
    /**
     * Target for request
     * Player UUID, Server IP & etc.
     */
    target: string;
}

export * from "./profile";
export * from "./server";
