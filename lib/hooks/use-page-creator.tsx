import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import prompt from '../../prompt/base_page_creator_plugin.md'
import { nanoid, parseJSON } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
// import { codeRunnerDef } from '../functions'
import { useChat } from 'ai/react'
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk'
import { useRef, useState } from 'react'
import { Operator } from '@/components/float-chatter/types'
import JSON5 from 'json5'

const fnKey = 'create_base_page'
export const pageCreatorFnDef = {
  name: fnKey,
  description: '创建web页面，返回结果将告诉你创建是否成功',
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
// 子agent自己用的function call
const dynamicOutputDef = {
  name: 'gen_page_from_code',
  description: '执行代码并创建页面，返回结果将告诉你创建是否成功',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'javascript code'
      }
    },
    required: ['code']
  }
}
const initialMessages: Message[] = [
  {
    role: 'system',
    content: prompt,
    id: nanoid()
  }
]
export const usePageCreatorAgent = (operate: Operator,setPageStatus:(status:string)=>void) => {
  const lastMsgRef = useRef<Message | null>(null)

  const { reload, setMessages } = useChat({
    api: '/api/chat-common',
    body: {
      modelConfig: {
        model: 'gpt-3.5-turbo-1106',
        functions:[dynamicOutputDef]
        // tools: [
        //   {
        //     function: dynamicOutputDef,

        //     /**
        //      * The type of the tool. Currently, only `function` is supported.
        //      */
        //     type: 'function'
        //   }
        // ]
      }
    },
    onFinish: (message: Message) => {
      lastMsgRef.current = message
    },
    experimental_onFunctionCall: async (chatMessages, functionCall) => {
      console.log('gen code:00000', functionCall)
      
      if (functionCall.name === 'gen_page_from_code') {
        console.log('gen code:11111', functionCall.arguments)

        // 使用正则表达式替换所有反引号为双引号
        const args = parseJSON(functionCall.arguments || '{}')
        try {
          const code = args.code
          console.log('gen code:22222', code)
          setPageStatus("loaded")
          operate({
            type: 'add',
            data: {
              id: nanoid(),
              content: code,
              type: 'Dynamic'
            }
          })
        } catch (e) {
          console.log('parse code err:')
          console.error(e)
        }
      }
    }
  })
  // 父agent调用子agent的函数
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
    setPageStatus("loading")
    const curDetailData = await BaseAISDK.getCurDetailData()
    const curListData = await BaseAISDK.getCurListData()
    //TODO:调整prompt使得生成页面更加美观， 且能适应各种页面
    //TODO:优化流程， 使得其更快
    // const bgPrompt = `
    //   当前的详情数据示例为: ${JSON.stringify(curDetailData, null, 2)}
    //   请你结合这些数据的含义，判断应该强调的信息，以创建不同样式的页面
    // `
    const bgPrompt = `
        请调用sdk获取数据，创建各类界面
        创建详情页面时，以表名为大标题，置于页面顶端，字段以 “字段名 字段值”为一行，纵向排列
    `
    console.log(`ccccccccall pageCreator agent--in-progress: ${bgPrompt}`)
    const bgMessage = {
      role: 'system',
      content: bgPrompt,
      id: nanoid()
    } as const
    setMessages([
      bgMessage,
      ...initialMessages,
      {
        role: 'user',
        content: functionCall.arguments || '',
        id: nanoid()
      }
    ])
    await reload()
    console.log(
      `ccccccccall pageCreator agent result:${JSON.stringify(
        { result: lastMsgRef.current?.content },
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
            result: '生成完成'
          })
        }
      ]
    } as ChatRequest
  }
  ;(handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) =>
    fn.name === fnKey
  return handleCall as FunctionCallHandlerWithAssert
}
