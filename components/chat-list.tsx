import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import clsx from 'clsx'

export interface ChatList {
  messages: Message[],
  hiddenMessageNum:number//隐藏信息数量
 }

export function ChatList({ messages,hiddenMessageNum }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={clsx({
            hidden: index <= hiddenMessageNum-1
          })}
        >
          <ChatMessage message={message} />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
}
