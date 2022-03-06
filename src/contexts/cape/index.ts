import { Context, IContextOptions } from '../context';
import { Hash } from '../player';

import { kSerializeData, pickProperties } from '../../utils';

import { CapeHash, CapeName, CapeType } from './types';

export interface ICapeContextOptions extends IContextOptions<CapeContext> {
    /**
     * Cape hash
     */
    hash: Hash;
}

export class CapeContext extends Context<CapeContext> {

    /**
     * Cape hash
     */
    readonly hash: Hash;

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
    get url(): string {
        return `${this.endpoint}/texture/${this.hash}.png`;
    }

    /**
     * Get cape type
     */
    get type(): CapeType {
        return Object.values(CapeHash).includes(this.hash as CapeHash) ?
            CapeType.MINECRAFT
            :
            CapeType.OPTIFINE;
    }

    /**
     * Get cape name
     */
    get name(): CapeName {
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
    [kSerializeData](): any {
        return pickProperties(this, [
            'hash',
            'url',
            'name',
            'type'
        ]);
    }
}

export * from './types';
