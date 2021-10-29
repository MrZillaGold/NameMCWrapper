import { Context, IContextOptions } from './context';
import { Hash } from './player';

import { kSerializeData, pickProperties } from '../utils';

export interface ICapeContextOptions extends IContextOptions<CapeContext> {
    /**
     * Cape hash
     */
    hash: Hash;
}

/**
 * Cape types
 */
export enum CapeType {
    MINECRAFT = 'minecraft',
    OPTIFINE = 'optifine'
}

/**
 * Capes names
 */
export enum CapeName {
    MINECON_2016 = 'MineCon 2016',
    MINECON_2015 = 'MineCon 2015',
    MINECON_2013 = 'MineCon 2013',
    MINECON_2012 = 'MineCon 2012',
    MINECON_2011 = 'MineCon 2011',
    REALMS_MAPMAKER = 'Realms Mapmaker',
    MOJANG = 'Mojang',
    MOJANG_CLASSIC = 'Mojang (Classic)',
    TRANSLATOR = 'Translator',
    TRANSLATOR_CHINESE = 'Translator (Chinese)',
    TRANSLATOR_JAPANESE = 'Translator (Japanese)',
    MOJIRA_MODERATOR = 'Mojira Moderator',
    COBALT = 'Cobalt',
    SCROLLS = 'Scrolls',
    DB = 'dB',
    SNOWMAN = 'Snowman',
    MILLIONTH_CUSTOMER = 'Millionth Customer',
    SPADE = 'Spade',
    PRISMARINE = 'Prismarine',
    TURTLE = 'Turtle',
    BIRTHDAY = 'Birthday',
    MIGRATOR = 'Migrator',
    MOJANG_STUDIOS = 'Mojang Studios',
    OPTIFINE = 'Optifine'
}

/**
 * Capes hashes
 */
export enum CapeHash {
    MINECON_2016 = '1981aad373fa9754',
    MINECON_2015 = '72ee2cfcefbfc081',
    MINECON_2013 = '0e4cc75a5f8a886d',
    MINECON_2012 = 'ebc798c3f7eca2a3',
    MINECON_2011 = '9349fa25c64ae935',
    REALMS_MAPMAKER = '11a3dcc4d826d0a1',
    MOJANG = 'cb5dd34bee340182',
    MOJANG_CLASSIC = '298ae017a64261ad',
    TRANSLATOR = '129a4675704fa3b8',
    TRANSLATOR_CHINESE = 'd059f1a18b159eb6',
    TRANSLATOR_JAPANESE = 'aa02d4b62762ff22',
    MOJIRA_MODERATOR = '8dd71c1ee6ec0ae4',
    COBALT = '696b6cc29946b968',
    SCROLLS = '116bacd62b233157',
    DB = '77421d9cf72e07e9',
    SNOWMAN = '5e68fa78bd9df310',
    MILLIONTH_CUSTOMER = 'd3c7ac835b24eb29',
    SPADE = '7a939dc1a7ad4505',
    PRISMARINE = '88f1509813f4e324',
    TURTLE = '8c05ef3c54870d04',
    MIGRATOR = '8a6cc02cc86e43f1',
    BIRTHDAY = 'aab5a23c7495fc70',
    MOJANG_STUDIOS = 'c00df589ebea3ad6'
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
        return Object.values(CapeHash)
            .includes(this.hash as CapeHash) ?
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
