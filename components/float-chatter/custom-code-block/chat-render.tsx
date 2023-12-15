import { runCodeSync } from '@/app/code_runner'
import * as MUI from '@mui/material'
import React, { FunctionComponent } from 'react'
import { CardMessage } from '../types'
import { ChatMessage } from '@/components/chat-message'

interface IChatRenderProps {
  card: CardMessage
  options?: Record<string, any>
}

export const ChatRender: FunctionComponent<IChatRenderProps> = props => {
  const { card } = props
  return <ChatMessage message={card}></ChatMessage>
}
