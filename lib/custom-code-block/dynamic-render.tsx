import { runCodeSync } from '@/app/code_runner'
import * as MUI from '@mui/material'
import React, { FunctionComponent } from 'react'

interface IDynamicRenderProps {
  code: string
  options: Record<string, any>
}

export const DynamicRender: FunctionComponent<IDynamicRenderProps> = (
  props: IDynamicRenderProps
) => {
  const { code } = props
  return runCodeSync(code, { MUI, React }) as JSX.Element
}
