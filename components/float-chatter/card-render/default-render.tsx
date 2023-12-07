import { runCodeSync } from '@/app/code_runner'
import * as MUI from '@mui/material'
import React, { FunctionComponent } from 'react'
import { CardMessage } from '../message-context'

interface IDefaultRenderProps {
  card: CardMessage
  options?: Record<string, any>
}

export const DefaultRender: FunctionComponent<IDefaultRenderProps> = props => {
  const { card } = props
  return <div>{JSON.stringify(card.content)}</div>
}
