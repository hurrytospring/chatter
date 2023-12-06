import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import prompt from '../../prompt/base_open_plugin.md'
import { useChat } from 'ai/react/dist'
import { nanoid } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
import { codeRunnerDef } from '../functions'

const fnKey = 'create_base_system'
export const sysFnDef ={
    "name": fnKey,
    "description": "执行base建表，建字段，建记录等动作，返回是否成功",
    "parameters": {
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "description": "一段话，描述要建设什么样的表，什么样的字段，什么样的记录"
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
export const useSysAgent = () => {
  const { reload, setMessages, isLoading } = useChat({ api: 'api/chat-common' ,body:{functions:[codeRunnerDef]},experimental_onFunctionCall(chatMessages, functionCall) {
      
  },})
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
