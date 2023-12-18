import { FunctionCall, Message } from "ai";

export type CardMessageType='Default'|'Dynamic'|'Chat'|'Loading';
export interface CardMessage extends Message{
    type: CardMessageType
    sender: string
    status: 'pending' | 'done',
    hidden?: Boolean,
    customContent:''
  }
export  interface Operation {
    type: 'add' | 'update'
    data: Partial<CardMessage>
  }
  
export  interface ContextValue {
    cards: CardMessage[]
    operate: (op: Operation) => void
  }
 export type Operator= (operation: Operation) => void
