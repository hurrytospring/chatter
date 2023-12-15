import { ChatMessage } from '@/components/chat-message';
import { CardMessageType } from '../types';
import { DefaultRender } from './default-render'
import { DynamicRender } from './dynamic-render'
import { ChatRender } from './chat-render';
import { LoadingRender } from './loading-render';

export const cardCompMapping:Record<CardMessageType,React.FC<any>> = {
  'Dynamic': DynamicRender,
  'Chat':ChatRender,
  'Default':DefaultRender,
  "Loading":LoadingRender
} as const;