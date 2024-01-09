import { FunctionCall, Message } from "ai";
import { ILoadingItemState } from "./custom-code-block/loading-render";

export type CardMessageType='Default'|'Dynamic'|'Chat'|'Loading';
export interface CardMessage<T=any> extends Message{
    type: CardMessageType
    sender: string
    status: 'pending' | 'done',
    hidden?: Boolean,
    customContent:T
  }
export  interface Operation {
    type: 'add' | 'update'
    data: Partial<CardMessage>
  }
  
export  interface ContextValue {
    cards: CardMessage[]
    operate: (op: Operation) => void
    addLoadingStep: (item: ILoadingItemState) => void
    finishLoadingStep: (id?: string) => void
  }
 export type Operator= (operation: Operation) => void
