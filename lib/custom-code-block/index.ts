import { ReactComponentElement } from 'react'
import { DynamicRender } from './dynamic-render'

export const langCompMapping: Record<string, React.FunctionComponent<any>> = {
  'custom-lang-dynamic-render': DynamicRender
}
