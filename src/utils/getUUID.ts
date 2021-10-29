import axios, { AxiosError } from 'axios';

import { WrapperError } from '../error';

import { nameRegExp } from '../utils';

export async function getUUID(endpoint: string, username: string): Promise<string> {
    const isNickname = username.match(nameRegExp);

    if (!isNickname) {
        throw new WrapperError('INVALID_NICKNAME', username);
    }

    return isNickname.groups?.uuid ?? await axios.get<{
        uuid: string
    }>(`${endpoint}/mojang/v1/user/${username}`)
        .then(({ data: { uuid } }) => uuid)
        .catch((error: AxiosError) => {
            throw error?.response?.status === 404 ?
                new WrapperError('NOT_FOUND', username)
                :
                error;
        });
}