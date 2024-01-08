import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import prompt from '../../prompt/base_dashboard_creator_plugin.md'
import { useChat } from 'ai/react'
import { nanoid, parseJSON } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
import { codeGeneratorDef, rejectDef } from '../functions'
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk'
import { Operator } from '@/components/float-chatter/types'
import { cache } from 'react'
import { runCode } from '@/app/code_runner'
import { FieldType, bitable } from '@lark-base-open/js-sdk'
import lodash from 'lodash'
import * as dashboardStruct from '../base-ai-sdk/dashboardStruct'
import { StringToBoolean } from 'class-variance-authority/dist/types'

const fnKey = 'create_dashboard'
export const dashboardFnDef = {
  name: fnKey,
  description: '执行base的各种操作，包括对仪表盘的新建，图表的创建，和内容扩充。',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: '一段话，描述要建设什么样的仪表盘，添加图表的类型是什么，数据源是哪张数据表，数据的范围是什么，图表的横轴和纵轴使用什么字段。'
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
    createdAt: new Date(),
  }
]
export const useDashboardAgent = (operate: Operator) => {
  const { reload, setMessages, isLoading } = useChat({
    api: '/api/chat-common',
    body: {
      modelConfig: {
        model: 'gpt-4-1106-preview',
        // model: 'gpt-3.5-turbo',
        functions: [codeGeneratorDef, rejectDef]
      }
    },


    experimental_onFunctionCall: async (chatMessages, functionCall) => {
      console.log('————————dashboardAgent receiverd Call!————————\n', functionCall)
      let result: string = ""
      if (functionCall.name == 'gen_javascript_code') {
        try {
          //注意functionCall返回的code参数可能不符合json格式
          const code: string = JSON.parse(functionCall.arguments || `{}`).code || ''
          console.log('————————dashboardAgent generated code————————\n', code)
          //执行代码
          result = await runCode(code, { BaseAISDK, dashboardStruct })
          console.log("————————result————————\n", result)
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
      else if (functionCall.name == 'gen_reject_reason') {
        try {
          const reason: string = JSON.parse(functionCall.arguments || `{}`).judgement || ''
          console.log('————————dashboardAgent rejected for reason————————\n', reason)
          result = reason
        } catch (e) {
          result = "评估失败"
          console.log('err', e)
        }

        const functionResponse: ChatRequest = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'reject_request',
              role: 'function' as const,
              content: result,
              createdAt: new Date(),
            }
          ]
        }
        return functionResponse
      }
    }
  })


  const handleCall: FunctionCallHandler = async (chatMessages, functionCall) => {
    console.log('————————dashboardAgent is called———————\n', functionCall)

    const metaInfo = await BaseAISDK.getMetaList();
    const combinedMetaListsString = JSON.stringify(metaInfo, null, 2);

    // console.log('______________多维表格元信息_____________\n',combinedMetaListsString)
    const bgPrompt = combinedMetaListsString + `
      请你分析如果使用之前告知的BaseAISDK中的函数创建仪表盘和图表时，用户的需求中给出的数据表名和字段名是否存在于这些多维表格的数据表元数据和数据表中包含的字段元数据中，如果都存在，则生成一段javascript代码，达成用户需要进行的操作；如果不都存在就给出用户输入与元数据中不一致的部分。
    `

    console.log('————————dashboardAgent in progress————————\n', bgPrompt)

    const bgMessage = {
      role: 'system',
      content: bgPrompt,
      id: nanoid(),
      createdAt: new Date(),
    } as const

    setMessages([
      ...initialMessages,
      {
        role: 'user',
        content: functionCall.arguments || '',
        id: nanoid(),
        createdAt: new Date(),
      },
      bgMessage
    ])


    console.log('————————new messages dashboardAgent got————————\n', JSON.stringify([
      {
        role: 'user',
        content: functionCall.arguments || '',
        id: nanoid(),
        createdAt: new Date(),
      }
    ], null, 2))

    await reload()


    return {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: fnKey,
          role: 'function' as const,
          content: '仪表盘部分完成，如有剩余流程会继续执行下一步操作。',
          createdAt: new Date(),
        }
      ]
    } as ChatRequest
  };
  (handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) => fn.name === fnKey
  return handleCall as FunctionCallHandlerWithAssert
}
