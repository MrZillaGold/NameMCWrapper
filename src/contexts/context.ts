import { inspectable } from "inspectable";

import { ContextUnion, IContextOptions } from "../interfaces";

import { applyPayload, kSerializeData } from "../utils";

/**
 * @hidden
 */
export class Context<T extends ContextUnion> {

    /**
     * Parameters passed to the constructor during NameMC class initialization
     */
    readonly options: IContextOptions["options"];
    /**
     * Class for API Requests
     */
    readonly api: IContextOptions["api"];
    /**
     * @hidden
     */
    readonly client: IContextOptions["client"];

    /**
     * @hidden
     */
    payload: IContextOptions["payload"];

    /**
     * @hidden
     */
    constructor({ options, client, api, payload }: IContextOptions) {
        this.options = options;
        this.client = client;
        this.api = api;
        this.payload = payload;
    }

    /**
     * @hidden
     */
    protected setupPayload(): void {
        if (this.payload) {
            applyPayload(this, this.payload);
        }
    }

    /**
     * Get context JSON
     */
    toJSON(): T {
        return this[kSerializeData]();
    }

    /**
     * @hidden
     */
    [kSerializeData](): any {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { options, client, ...payload } = this;

        return payload;
    }
}

inspectable(Context, {
    serialize: (instance) => instance.toJSON(),
    stringify: (instance, payload, context): string => (
        `${context.stylize(instance.constructor.name, "special")} ${context.inspect(payload)}`
    )
});
