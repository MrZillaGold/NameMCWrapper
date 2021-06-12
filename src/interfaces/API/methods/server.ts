import { IParams } from "./";

export interface IServerLikesParams extends IParams {
    /**
     * Player uuid
     */
    profile: string;
}
