/**
 * Skin model type
 */
import { Hash } from '../player';

export enum Model {
    UNKNOWN = 'unknown',
    CLASSIC = 'classic',
    SLIM = 'slim'
}
export type ModelUnion = `${Model}`;

/**
 * Skin transformation type
 */
export enum Transformation {
    GRAYSCALE = 'grayscale',
    INVERT = 'invert',
    ROTATE_HUE_180 = 'rotate-hue-180',
    ROTATE_HEAD_LEFT = 'rotate-head-left',
    ROTATE_HEAD_RIGHT = 'rotate-head-right',
    HAT_PUMPKIN_MASK_1 = 'hat-pumpkin-mask-1',
    HAT_PUMPKIN_MASK_2 = 'hat-pumpkin-mask-2',
    HAT_PUMPKIN_MASK_3 = 'hat-pumpkin-mask-3',
    HAT_PUMPKIN_MASK_4 = 'hat-pumpkin-mask-4',
    HAT_PUMPKIN = 'hat-pumpkin',
    HAT_PUMPKIN_CREEPER =  'hat-pumpkin-creeper',
    HAT_SANTA = 'hat-santa'
}
export type TransformationUnion = `${Transformation}`;

export interface ITransformSkinOptions {
    /**
     * Skin id
     */
    skin: Hash;
    /**
     * Skin transformation type
     */
    transformation?: Transformation | TransformationUnion;
    /**
     * Skin model
     */
    model?: Model | ModelUnion;
}
