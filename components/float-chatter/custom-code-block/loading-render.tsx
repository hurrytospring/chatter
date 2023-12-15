import { runCodeSync } from '@/app/code_runner'
import * as MUI from '@mui/material'
import React, { FunctionComponent } from 'react'
import { CardMessage } from '../types'
import { ChatMessage } from '@/components/chat-message'

interface IChatRenderProps {
  card: CardMessage
  options?: Record<string, any>
}

export const LoadingRender: FunctionComponent<IChatRenderProps> = props => {
  const { card } = props
  return (
    <div>
      <div>思考中...</div>
      <div>调用函数：{card.content}</div>
        <div className='h-5 leading-5'>
      请稍等...<MUI.CircularProgress  size="0.9rem"/>

          </div> 
    </div>
  )
}
