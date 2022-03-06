/**
 * NameMC Search Name Status
 */
export enum NameStatus {
    AVAILABLE = 'available',
    AVAILABLE_LATER = 'available_later',
    UNAVAILABLE = 'unavailable',
    INVALID = 'invalid'
}
export type NameStatusUnion = `${NameStatus}`;
