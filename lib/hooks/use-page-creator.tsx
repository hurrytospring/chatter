import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import prompt from '../../prompt/base_page_creator_plugin.md'
import { nanoid } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
import { codeRunnerDef } from '../functions'
import { useChat } from 'ai/react'
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk'
import { useRef, useState } from 'react'

const fnKey = 'create_base_page'
export const pageCreatorFnDef = {
  name: fnKey,
  description: '创建web页面，将会返回给你一段代码可以提供给用户来生成页面',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description:
          '一段话，描述要创建什么样的页面如：详情展示页面，详情编辑页面，列表页面，图表页面等。并描述希望获得的页面设计风格，配色主题等等。'
      }
    },
    required: ['content']
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
  const lastMsgRef=useRef<Message|null>(null)
  const { reload, setMessages, append } = useChat({
    api: '/api/chat-common',
    body: { functions: [codeRunnerDef] },
    onFinish: (message: Message) => {
      lastMsgRef.current=message;
    }
  })
  const handleCall: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    console.log(
      `ccccccccall pageCreator agent:${JSON.stringify(
        {
          functionCall,
          chatMessages
        },
        null,
        2
      )}`
    )
    const curDetailData = await BaseAISDK.getCurDetailData()
    const curListData = await BaseAISDK.getCurListData()
    const bgPrompt = `
      当前的列表数据示例为: ${JSON.stringify(curListData, null, 2)}，
      当前的详情数据示例为: ${JSON.stringify(curDetailData, null, 2)}
      请你结合这些数据的含义，判断应该强调的信息，以创建不同样式的页面
    `
    console.log(`ccccccccall pageCreator agent--in-progress: ${bgPrompt}`)
    const bgMessage = {
      role: 'system',
      content: bgPrompt,
      id: nanoid()
    } as const
    setMessages([...initialMessages, bgMessage,{
      role: 'user',
      content: functionCall.arguments || '',
      id: nanoid()
    }])
    await reload()
    console.log(
      `ccccccccall pageCreator agent result:${JSON.stringify(
        { result:lastMsgRef.current?.content },
        null,
        2
      )}`
    )
    return {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: fnKey,
          role: 'function' as const,
          content: JSON.stringify({
            result:lastMsgRef.current?.content
          })
        }
      ]
    } as ChatRequest
  }
  ;(handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) =>
    fn.name === fnKey
  return handleCall as FunctionCallHandlerWithAssert
}
