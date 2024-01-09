import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import clsx from 'clsx'
import { CardMessage } from './float-chatter/types'
import { cardCompMapping } from './float-chatter/custom-code-block'
import { CircularProgress } from '@mui/material'
import { useCardMessageContext } from './float-chatter/message-context'

export interface ChatList {
  messages: CardMessage[],
  hiddenMessageNum:number//隐藏信息数量
 }

export function ChatList({ messages,hiddenMessageNum}: ChatList) {
  if (!messages.length) {
    return null
  }
  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div
          key={index}
        >
          <ChatCardMessage card ={message}/>
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
}


function ChatCardMessage({card}:{card:CardMessage}){
  // if(card.status == 'pending'){
  //   return <CircularProgress/>
  // }
  const Comp = cardCompMapping[card.type] || cardCompMapping.Default
  return <Comp card={card}/>
}
