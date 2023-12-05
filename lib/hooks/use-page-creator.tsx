import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import prompt from '../../prompt/base_open_plugin.md'
import { useChat } from 'ai/react/dist'
import { nanoid } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
import { codeRunnerDef } from '../functions'

const fnKey = 'create_base_page'
export const createBasePageFnDef ={
    "name": fnKey,
    "description": "创建web页面",
    "parameters": {
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "description": "一段话，描述要创建什么样的页面如：详情展示页面，详情编辑页面，列表页面，图表页面等。并描述希望获得的页面设计风格，配色主题等等。"
            }
        },
        "required": [
            "content"
        ]
    }

}


const initialMessages: Message[] = [
  {
    role: 'system',
    content: prompt,
    id: nanoid()
  }
]
export const usePageCreatorAgent = () => {
  const { reload, setMessages, isLoading } = useChat({ api: 'api/chat/common' ,body:{functions:[codeRunnerDef]}})
  const handleCall: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    setMessages([
      ...initialMessages,
      { role: 'user', content: functionCall.arguments?.[0] || '', id: nanoid() }
    ])
    const result = await reload()
    return {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: fnKey,
          role: 'function' as const,
          content: JSON.stringify({
            result
          })
        }
      ]
    } as ChatRequest
  }
;(handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) =>
    fn.name === fnKey
  return handleCall
}
