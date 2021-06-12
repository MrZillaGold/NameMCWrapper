import { Context } from "./context";

import { kSerializeData, pickProperties } from "../utils";

import { CapeHash, CapeName, CapeType, ICapeContext, ICapeContextOptions } from "../interfaces";

export class CapeContext extends Context implements ICapeContext {

    /**
     * Cape hash
     */
    readonly hash: ICapeContext["hash"];

    /**
     * @hidden
     */
    protected endpoint = this.options.getEndpoint();

    /**
     * @hidden
     */
    constructor({ hash, ...options }: ICapeContextOptions) {
        super(options);

        this.hash = hash;
    }

    /**
     * Get cape url
     */
    get url(): ICapeContext["url"] {
        return `${this.endpoint}/texture/${this.hash}.png`;
    }

    /**
     * Get cape type
     */
    get type(): ICapeContext["type"] {
        return Object.values(CapeHash)
            .includes(this.hash as CapeHash) ?
            CapeType.MINECRAFT
            :
            CapeType.OPTIFINE;
    }

    /**
     * Get cape name
     */
    get name(): ICapeContext["name"] {
        const cape = new Map(
            Object.entries(CapeHash)
                .map((entry) => entry.reverse() as [string, string])
        )
            .get(this.hash);

        if (cape) {
            const capeName = new Map(
                Object.entries(CapeName)
            )
                .get(cape);

            return capeName as CapeName;
        }

        return CapeName.OPTIFINE;
    }

    /**
     * Check is Minecraft cape
     */
    get isMinecraft(): boolean {
        return this.type === CapeType.MINECRAFT;
    }

    /**
     * Check is Optifine cape
     */
    get isOptifine(): boolean {
        return this.type === CapeType.OPTIFINE;
    }

    /**
     * @hidden
     */
    [kSerializeData](): ICapeContext {
        return pickProperties(this, [
            "hash",
            "url",
            "name",
            "type"
        ]);
    }
}
