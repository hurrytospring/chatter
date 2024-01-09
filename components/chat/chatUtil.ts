import { Message } from 'ai'
import { CardMessage, Operation } from '../float-chatter/types'

export function merge(
  messages: Message[],
  cards: CardMessage[],
  debugMode: boolean
): CardMessage[] {
  let chatCards = []
  chatCards = messages.map(message => {
    let status = ''
    return {
      ...message,
      type: 'Chat',
      sender: '',
      status: status
    } as CardMessage
  })
  const arr: CardMessage[] = [...chatCards, ...cards]
  arr.sort((a, b) => {
    const t1 = a.createdAt?.getTime() ?? 0
    const t2 = b.createdAt?.getTime() ?? 0
    return t1 - t2
  })
  return arr.filter((card, index) => {
    // 调试模式全部展示
    if (debugMode) return true
    // 系统消息，和调function消息的不展示
    if (['system', 'function'].includes(card.role)) {
      return false
    }
    //function call 的回复不展示
    if (card.function_call) {
      return false
    }
    return true
  })
}
