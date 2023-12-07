import { runCodeSync } from '@/app/code_runner'
import * as MUI from '@mui/material'
import React, { FunctionComponent } from 'react'
import { CardMessage } from '../types'
import { BaseAISDK } from '@/lib/base-ai-sdk/base-ai-sdk'

interface IDynamicRenderProps {
  card: CardMessage
  options?: Record<string, any>
}

export const DynamicRender: FunctionComponent<IDynamicRenderProps> = (
  props: IDynamicRenderProps
) => {
  const { card } = props
  return runCodeSync(card.content, { MUI, React, BaseAISDK }) as JSX.Element
}
