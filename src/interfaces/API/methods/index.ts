import { IFriend, IFriendsParams } from "./profile";
import { IServerLikesParams } from "./server";

export interface IMethods {
    profile: {
        friends(params: IFriendsParams): Promise<IFriend[]>;
    };
    server: {
        likes(params: IParams): Promise<string[]>;
        likes(params: IServerLikesParams): Promise<boolean>;
    };
}

export interface IParams {
    target: string;
}

export * from "./profile";
export * from "./server";
