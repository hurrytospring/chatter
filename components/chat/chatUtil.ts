import { Message } from 'ai'
import { CardMessage, Operation } from '../float-chatter/types'

export function merge(
  messages: Message[],
  cards: CardMessage[],
  debugMode: boolean,
): CardMessage[] {
  let chatCards = []
  chatCards = messages.map(message => {
    let status = '';
    return {
      ...message,
      type: 'Chat',
      sender: '',
      status: status
    } as CardMessage
  })
  const arr: CardMessage[] = [...chatCards, ...cards]
  arr.sort((a, b) => {
    const t1 = a.createdAt?.getTime() ?? 0;
    const t2 = b.createdAt?.getTime() ?? 0;
    return t1 - t2;
})
  return arr.filter((card, index) => {
    if(debugMode)return true;
    return !['system','function_call'].includes(card.role)
  })
}
