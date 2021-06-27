import { ISkinContext } from "./skin";
import { ICapeContext } from "./cape";
import { IRendersContext } from "./renders";
import { IPlayerContext } from "./player";
import { IServerContext } from "./server";
import { ISearchContext } from "./search";

export * from "./context";
export * from "./skin";
export * from "./cape";
export * from "./renders";
export * from "./player";
export * from "./server";
export * from "./search";

export type ContextUnion =
    ISkinContext
    | ICapeContext
    | IRendersContext
    | IPlayerContext
    | IServerContext
    | ISearchContext;
