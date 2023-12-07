export type CardMessageType='Default'|'Dynamic';
export interface CardMessage {
    id: string
    time: number
    type: CardMessageType
    sender: string
    content: any
    status: 'pending' | 'done'
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
