import cheerio from 'cheerio';
import { AxiosInstance } from 'axios';

import { API } from './api';
import { Options } from './options';
import { ServerContext, SkinContext } from './contexts';

import { profileSkinsRegExp } from './utils';

/**
 * @hidden
 */
export abstract class DataParser {

    abstract readonly options: Options;
    abstract readonly client: AxiosInstance;
    abstract readonly api: API;

    /**
     * @hidden
     */
    protected parseSkins(data: string): SkinContext[] {
        const $ = cheerio.load(data);

        return $('div.card-body.position-relative.text-center.checkered.p-1')
            .map((index, card) => new SkinContext({
                data: card,
                ...this
            }))
            .get();
    }

    /**
     * @hidden
     */
    protected parseServers(data: string): ServerContext[] {
        const $ = cheerio.load(data);

        return $('a.card-link')
            .map((index, data) => new ServerContext({
                data,
                ...this
            }))
            .get();
    }

    /**
     * @hidden
     */
    protected getProfileId(data: string): string {
        const $ = cheerio.load(data);

        const [profileId] = $('div.card-header.py-1 > strong > a')
            .map((index, element) => {
                const isProfileSkinsUrl = profileSkinsRegExp.exec(element.attribs.href);

                if (isProfileSkinsUrl) {
                    return isProfileSkinsUrl[1];
                }
            })
            .get();

        return profileId;
    }
}
