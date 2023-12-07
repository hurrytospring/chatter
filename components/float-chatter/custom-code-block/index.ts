import { CardMessageType } from '../types';
import { DefaultRender } from './default-render'
import { DynamicRender } from './dynamic-render'

export const cardCompMapping:Record<CardMessageType,React.FC<any>> = {
  'Dynamic': DynamicRender,
  'Default':DefaultRender
} as const;