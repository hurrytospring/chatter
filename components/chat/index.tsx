import {
  CardMessageProvider,
  useCardMessageContext
} from '../float-chatter/message-context'
import { FloatChatter } from '../float-chatter/float-chatter'
import { ChatProps } from './types'
import { ChatPure } from './chat'
import './index.less'

export function Chat(props: ChatProps) {
  return (
    <CardMessageProvider>
      <div className="chatter-wrapper">
        <ChatPure {...props}></ChatPure>
        <FloatChatter className="chatter-wrapper__float" />
      </div>
    </CardMessageProvider>
  )
}
