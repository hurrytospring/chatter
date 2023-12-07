import { runCodeSync } from '@/app/code_runner'
import * as MUI from '@mui/material'
import React, { FunctionComponent } from 'react'
import { CardMessage } from '../message-context'

interface IDynamicRenderProps {
  card: CardMessage
  options?: Record<string, any>
}

export const DynamicRender: FunctionComponent<IDynamicRenderProps> = (
  props: IDynamicRenderProps
) => {
  const { card } = props
  return runCodeSync(card.content, { MUI, React }) as JSX.Element
}
