import { IFriend } from "./friend";
import { IServerLikesParams } from "./server";

export interface IMethods {
    profile: IProfile;
    server: IServer;
}

interface IProfile {
    friends(params: IParams): Promise<IFriend[]>;
}

interface IServer {
    likes(params: IParams): Promise<string[]>;
    likes(params: IServerLikesParams): Promise<boolean>;
}

export interface IParams {
    target: string;
}
