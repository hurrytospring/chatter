import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
<<<<<<< HEAD
import prompt from '../../prompt/newPrompt.md'
=======
import prompt from '../../prompt/base_open_plugin.md'
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5
import { useChat } from 'ai/react/dist'
import { nanoid, parseJSON } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
import { codeGeneratorDef } from '../functions'
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk'
import { Operator } from '@/components/float-chatter/types'
import { cache } from 'react'
import { runCode } from '@/app/code_runner'
import { FieldType, bitable } from '@lark-base-open/js-sdk'
import lodash from 'lodash'


<<<<<<< HEAD

=======
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5
const fnKey = 'create_base_system'
export const sysFnDef = {
  name: fnKey,
  description: '执行base的各种操作，包括对表，字段，记录的查询，新增，删除等动作，并返回是否成功',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: '一段话，描述要建设什么样的表，什么样的字段，什么样的记录'
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
export const useSysAgent = (operate: Operator) => {
  const { reload, setMessages, isLoading } = useChat({
    api: '/api/chat-common',
    body: {
      modelConfig: {
<<<<<<< HEAD
        model: 'gpt-4-1106-preview',
        functions: [codeGeneratorDef]
      }
    },


    experimental_onFunctionCall: async (chatMessages, functionCall) => {
      console.log('————————sysAgent receiverd Call!————————\n', functionCall)
      let result: string = ""
      try {
        //注意functionCall返回的code参数可能不符合json格式
        const code: string = JSON.parse(functionCall.arguments || `{}`).code || ''
        console.log('————————sysAgent generated code————————\n', code)
        //执行代码
        result = await runCode(code, { BaseAISDK })
        console.log("____result____\n", result)
=======
        model: 'gpt-3.5-turbo-1106',
        functions: [codeGeneratorDef]
      }
    },
    experimental_onFunctionCall: async (chatMessages, functionCall) => {
      console.log('sys Call!', functionCall)
      let result:string = ""
      try {
        //注意functionCal返回的code参数可能不符合json格式
        const code:string = JSON.parse(functionCall.arguments || `{}`).code || ''
        console.log('sys call code\n', code)
        //执行代码
        //TODO：注意此处生成的代码逻辑仍有明显问题
        result = await runCode(code, { bitable, FieldType,lodash })
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5
      } catch (e) {
        result = "生成失败"
        console.log('err', e)
      }

      const functionResponse: ChatRequest = {
        messages: [
          ...chatMessages,
          {
            id: nanoid(),
            name: 'run_javascript_code',
            role: 'function' as const,
<<<<<<< HEAD
            // content: JSON.stringify({
            //   result
            // })
            content: result
=======
            content: JSON.stringify({
              result
            })
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5
          }
        ]
      }
      return functionResponse
    }
  })
<<<<<<< HEAD


  const handleCall: FunctionCallHandler = async (chatMessages,functionCall) => {
    console.log('————————sysAgent is called———————\n', functionCall)

    const bgPrompt = `
      请你结合之前告知的BaseAISDK中的内容和操作，以及用户的需求，生成一段javascript代码，达成用户需要进行的操作。
    `

    console.log('————————sysAgent in progress————————\n', bgPrompt)

=======
  const handleCall: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    console.log('call sysAgent', functionCall)
    const bgPrompt = `
      请你结合之前的告知的sdk内容和操作，生成一段javascript代码，达成用户需要进行的操作,注意code参数必须是json形式
    `
    console.log('sysAgent in progress', bgPrompt)
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5
    const bgMessage = {
      role: 'system',
      content: bgPrompt,
      id: nanoid()
    } as const

    setMessages([
      bgMessage,
      ...initialMessages,
<<<<<<< HEAD
      { role: 'user', content: functionCall.arguments || '', id: nanoid() }
    ])


    console.log('————————new messages sysAgent got————————\n', JSON.stringify([
      bgMessage,
      { role: 'user', content: functionCall.arguments || '', id: nanoid() }
    ], null, 2))

    await reload()


=======
      { role: 'user', content: functionCall.arguments?.[0] || '', id: nanoid() }
    ])

    await reload()
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5
    return {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: fnKey,
          role: 'function' as const,
<<<<<<< HEAD
          content: '表格部分完成，如有剩余流程会继续执行下一步操作。',
        }
      ]
    } as ChatRequest
  }; 
  (handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) =>fn.name === fnKey
=======
          content: JSON.stringify({
            result: '生成完成',
          })
        }
      ]
    } as ChatRequest
  }
  ;(handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) =>
    fn.name === fnKey
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5
  return handleCall as FunctionCallHandlerWithAssert
}
