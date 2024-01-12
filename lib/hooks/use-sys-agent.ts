import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import prompt from '../../prompt/base_table_agent_plugin.md'
import { useChat } from 'ai/react'
import { nanoid, parseJSON } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
import { codeGeneratorDef } from '../functions'
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk'
import { Operator } from '@/components/float-chatter/types'
import { cache } from 'react'
import { runCode } from '@/app/code_runner'
import { FieldType, bitable } from '@lark-base-open/js-sdk'
import lodash, { isFunction } from 'lodash'
import { useRef } from 'react'

const fnKey = 'create_base_system'
export const sysFnDef = {
  name: fnKey,
  description: '执行base的各种操作，包括对表，字段，记录的查询，新增，删除等动作，并返回是否成功',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: '一段伪代码，包括一个或多个伪函数，每个子函数的格式形如：新增数据表（"体检表"）、添加字段("体检表","姓名","文本")'
      }
    },
    required: ['content']
  }
}

const initialMessages: Message[] = [
  {
    role: 'system',
    content: prompt,
    id: nanoid(),
    createdAt: new Date()
  }
]

export const useSysAgent = (operate: Operator) => {
  const lastMsgRef = useRef<Message | null>(null)
  const { reload, setMessages, isLoading } = useChat({
    api: '/api/chat-common',
    body: {
      modelConfig: {
        model: 'gpt-4-1106-preview',
        // model: 'gpt-3.5-turbo',
        functions: [codeGeneratorDef]
      }
    },
    onFinish: (message: Message) => {
      lastMsgRef.current = message
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
            content: result,
            createdAt: new Date(),
          }
        ]
      }
      return functionResponse
    }
  })


  const handleCall: FunctionCallHandler = async (chatMessages, functionCall) => {
    console.log('————————sysAgent is called———————\n', functionCall)
    const bgPrompt = `
      再次强调，数据表中的字段类型包括"文本"、"数字"、"单选"、"多选"、"链接"、"时间"、"创建时间"、"更新时间"、"评分"、"进度"、"邮箱"、"附件"，请不要自己新建类型。
      请你结合之前告知的BaseAISDK中的内容和操作，检查用户提供的信息是否足够完成其需求，如果可以则生成一段javascript代码，达成用户需要进行的操作；如果不能实现，则将原因返回给用户。
    `

    console.log('————————sysAgent in progress————————\n', bgPrompt)

    const bgMessage = {
      role: 'system',
      content: bgPrompt,
      id: nanoid(),
      createdAt: new Date(),

    } as const

    setMessages([
      bgMessage,
      ...initialMessages,
      {
        role: 'user',
        content: functionCall.arguments || '',
        id: nanoid(),
        createdAt: new Date()
      }
    ])


    console.log('————————new messages sysAgent got————————\n', JSON.stringify([
      { role: 'user', content: functionCall.arguments || '', id: nanoid(), createdAt: new Date() }
    ], null, 2))

    await reload()


    return {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: fnKey,
          role: 'function' as const,
          content: '流程完成或终止。',lastMsgRef,
          createdAt: new Date()
        }
      ]
    } as ChatRequest
  };
  (handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) => fn.name === fnKey
  return handleCall as FunctionCallHandlerWithAssert
}
