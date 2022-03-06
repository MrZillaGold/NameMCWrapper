export const STEVE_SKIN_HASH = '12b92a9206470fe2';

export const nameRegExp = /^(?:(?<name>[A-Za-z0-9_]{1,16})|(?<uuid>[0-9a-f]{8}-?[0-9a-f]{4}-?[0-5][0-9a-f]{3}-?[089ab][0-9a-f]{3}-?[0-9a-f]{12}))$/;
export const profileRegExp = /(?:[^]+)?\/profile\/(?:([^]+)\.([\d]+)|([^]+))/;
export const profileSkinsRegExp = /\/minecraft-skins\/profile\/([^]+)/;
export const skinRegExp = /(?:[^]+)?\/skin\/([^]+)/;
export const serverRegExp = /(?:[^]+)?\/server\/([^]+)/;

export const kSerializeData: unique symbol = Symbol('serializeData');
