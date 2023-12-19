import { runCodeSync } from '@/app/code_runner'
import * as MUI from '@mui/material'
import React, { useState, ReactElement, ComponentType, FunctionComponent } from 'react'
import { CardMessage } from '../types'
import { BaseAISDK } from '@/lib/base-ai-sdk/base-ai-sdk'

interface IDynamicRenderProps {
  card: CardMessage
  options?: Record<string, any>
}

type Props = {
  onError: () => void
  // 其他自定义属性的类型描述
}

const withError = <P extends object>(WrappedComponent: ComponentType<P>) => {
  return function WithError(props: P): ReactElement {
    const [hasError, setHasError] = useState(false)

    const handleOnError = () => {
      setHasError(true)
    }

    if (hasError) {
      return <div>页面生成出错</div>
    }

    return <WrappedComponent {...(props as P)} onError={handleOnError} />
  }
}
const DynamicRenderPure: FunctionComponent<IDynamicRenderProps> = (
  props: IDynamicRenderProps
) => {
  const { card } = props
  return runCodeSync(card.content, { MUI, React, BaseAISDK }) as JSX.Element
}
export const DynamicRender = withError(DynamicRenderPure)
