import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import { useChat } from 'ai/react/dist'
import { nanoid, parseJSON } from '../utils'
import { AgentConfig, FunctionCallHandlerWithAssert } from '../types'
import { before } from 'lodash'

export const useUniAgent = (agentConfig: AgentConfig) => {
  const fnKey = agentConfig.fnKey
  let fcResult = ""//用于存储functionCall结果
  //初始信息
  const initialMessages: Message[] = [
    {
      role: 'system',
      content: agentConfig.sysPrompt,
      id: nanoid()
    }
  ]

  const { reload, messages, setMessages, isLoading } = useChat({
    api: '/api/chat-common',
    body: {
      modelConfig: {
        model: 'gpt-3.5-turbo-1106',
        functions: [agentConfig.inFnDef] //子agent要调用的functionCall
      }
    },
    experimental_onFunctionCall: async (chatMessages, functionCall) => {
      const result = await agentConfig.onFunctionCall(
        chatMessages,
        functionCall
      )
      fcResult = result

      //console.log(fnKey + ' function called', chatMessages,messages,result)
      const functionResponse: ChatRequest = {
        messages: [
          ...chatMessages,
          {
            id: nanoid(),
            name: 'run_javascript_code',
            role: 'function' as const,
            content: JSON.stringify({
              result
            })
          }
        ]
      }
      return functionResponse
    }
  })
  //暴露给主agent的调用方法
  const handleCall: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    //console.log(agentConfig.fnKey + '  called'," chatMessages",chatMessages)
    const bgPrompt = await agentConfig.getBgPrompt()
    const bgMessage = {
      role: 'system',
      content: bgPrompt,
      id: nanoid()
    } as const
    const messageList:Message[] = [
      ...initialMessages,
      bgMessage,    
      { role: 'user', content: JSON.parse(functionCall?.arguments || "")?.content || '', id: nanoid() },
    ]
    console.log("before setMessage1",messages)
    // console.log("messageList",messageList.map(e=>e.content))
    setMessages(messageList)
    console.log("after setMessage1",messages)
    await reload()
    // console.log("handleCall return",chatMessages,messages)
    console.log("fcResult",fcResult,messages,chatMessages)
    return {
      messages: [
        ...chatMessages,
        ...messages,
        {
          id: nanoid(),
          name: fnKey,
          role: 'function' as const,
          content: JSON.stringify({
            result:fcResult
          })
        }
      ]
    } as ChatRequest
  }
  ;(handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) =>
    fn.name === fnKey
  return handleCall as FunctionCallHandlerWithAssert
}
