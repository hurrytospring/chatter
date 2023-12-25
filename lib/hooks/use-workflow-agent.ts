import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import prompt from '../../prompt/base_workflow_creator_plugin.md'
import { useChat } from 'ai/react'
import { nanoid, parseJSON } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
import { codeGeneratorDef} from '../functions'
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk'
import { Operator } from '@/components/float-chatter/types'
import { cache } from 'react'
import { runCode } from '@/app/code_runner'
import { FieldType, bitable } from '@lark-base-open/js-sdk'
import lodash from 'lodash'
import * as workflowStruct from '../base-ai-sdk/workflowStruct'

const fnKey = 'add_workflow'
export const workflowFnDef = {
  name: fnKey,
  description: '创建base中添加的工作流，使用多个子任务的组合来实现用户的需求',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: '一段话，描述要实现怎样的自动化功能：由什么触发，触发条件是什么，触发后执行怎样的action，最后任务完成的结果如何响应。'
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
    createdAt:new Date(),
  }
]
export const useWorkflowAgent = (operate: Operator) => {
  const { reload,setMessages, isLoading } = useChat({
    api: '/api/chat-common',
    body: {
      modelConfig: {
        model: 'gpt-4-1106-preview',
        functions: [codeGeneratorDef] 
      }
    },
    experimental_onFunctionCall: async (chatMessages, functionCall) => {
      console.log('————————workflowAgent receiverd Call!————————\n', functionCall)
      let result: string = ""
      try {
        //注意functionCall返回的code参数可能不符合json格式
        const code: string = JSON.parse(functionCall.arguments || `{}`).code || ''
        console.log('————————workflowAgent generated code————————\n', code)
        //执行代码
        result = await runCode(code, { BaseAISDK, workflowStruct})
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
            createdAt:new Date(),
          }
        ]
      }
      return functionResponse
    }
  })


  const handleCall: FunctionCallHandler = async (chatMessages,functionCall) => {
    console.log('————————workflowAgent is called———————\n', functionCall)

    const bgPrompt = `
      请你结合之前告知的BaseAISDK中的内容和操作，以及用户的需求，生成一段javascript代码，达成用户需要进行的操作。
    `

    console.log('————————workflowAgent in progress————————\n', bgPrompt)

    const bgMessage = {
      role: 'system',
      content: bgPrompt,
      id: nanoid(),
      createdAt: new Date(),
    } as const

    
    // // 引入JSON文件
    // const jsonData = require("prompt/function.json");

    // // 使用JSON数据
    // const funcsMessage = {
    //   role: 'system',
    //   content: JSON.stringify(jsonData),
    //   id: nanoid()
    // } as const


    setMessages([
      // funcsMessage,
      bgMessage,
      ...initialMessages,
      { role: 'user', 
      content:  functionCall.arguments || '',
      id: nanoid(),
      createdAt:new Date(), }
    ])


    console.log('————————new messages workflowAgent got————————\n', JSON.stringify([
      { role: 'user', 
      content: functionCall.arguments|| '', 
      id: nanoid(),
      createdAt:new Date(), },
      
    ], null, 2))

    await reload()


    return {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: fnKey,
          role: 'function' as const,
          content: '工作流部分完成，如有剩余流程会继续执行下一步操作。',
          createdAt:new Date(),
        }
      ]
    } as ChatRequest
  }; 
  (handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) =>fn.name === fnKey
  return handleCall as FunctionCallHandlerWithAssert
}
