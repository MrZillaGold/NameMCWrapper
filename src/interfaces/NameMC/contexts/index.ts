import { ISkinContext } from "./skin";
import { ICapeContext } from "./cape";
import { IRendersContext } from "./renders";
import { IPlayerContext } from "./player";
import { IServerContext } from "./server";

export * from "./context";
export * from "./skin";
export * from "./cape";
export * from "./renders";
export * from "./player";
export * from "./server";

export type ContextUnion =
    ISkinContext
    | ICapeContext
    | IRendersContext
    | IPlayerContext
    | IServerContext;
