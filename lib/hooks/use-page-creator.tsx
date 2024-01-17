import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import prompt from '../../prompt/base_page_agent_plugin.md'
import { nanoid, parseJSON } from '../utils'
import { FunctionCallHandlerWithAssert } from '../types'
// import { codeRunnerDef } from '../functions'
import { useChat } from 'ai/react'
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk'
import { useRef } from 'react'
import { Operator } from '@/components/float-chatter/types'

import { kv } from '@vercel/kv'
import { randomUUID } from 'crypto'
import { uniqueId } from 'lodash'

import { saveCode } from '@/app/actions'
import { createClient } from "@vercel/kv"



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
// const dynamicOutputDef = {
//   name: 'gen_page_from_code',
//   description: '执行代码并创建页面，返回结果将告诉你创建是否成功',
//   parameters: {
//     type: 'object',
//     properties: {
//       code: {
//         type: 'string',
//         description: 'javascript code'
//       }
//     },
//     required: ['code']
//   }
// }
const dynamicOutputDef2 = {
  name: 'generate_listPage_from_code',
  description: '执行代码并创建列表页面，返回结果将告诉你创建是否成功',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: '用来创建列表页面的javascript代码'
      }
    },
    required: ['code']
  }
}
const dynamicOutputDef3 = {
  name: 'generate_formPage_from_code',
  description: '执行代码并创建表单页面，返回结果将告诉你创建是否成功',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: '用来创建表单页面的javascript代码'
      }
    },
    required: ['code']
  }
}
const dynamicOutputDef4 = {
  name: 'generate_detailPages_from_code',
  description: '执行代码并创建详情页面，返回结果将告诉你创建是否成功',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: '用来创建详情页面的javascript代码'
      }
    },
    required: ['code']
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
export const usePageCreatorAgent = (operate: Operator) => {
  const lastMsgRef = useRef<Message | null>(null)

  const { reload, setMessages } = useChat({
    api: '/api/chat-common',
    body: {
      modelConfig: {
        // model: 'gpt-3.5-turbo',
        model: 'gpt-4-1106-preview',
        functions: [dynamicOutputDef2,dynamicOutputDef3,dynamicOutputDef4]
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
      let urls: string[] =[]
      console.log('!!!!!!!!!!got function call!!!!!!!!!!:\n', functionCall)

      // if (functionCall.name == 'gen_page_from_code') {
      //   try {

      //     // 使用正则表达式替换所有反引号为双引号
      //     const args = parseJSON(functionCall.arguments || '{}')
          
      //     const code = args.code
      //     const table =await BaseAISDK.getTable()
      //     const recordIds = await table.getRecordIdList()
      //     console.log('!!!!!!!!!!code!!!!!!!!!!\n', code)
      //     urls = await saveCode(code,recordIds)
      //     console.log('!!!!!!!!!!!urls!!!!!!!!!!!\n', urls)
          

      //     // setPageStatus("loaded")
      //     operate({
      //       type: 'add',
      //       data: {
      //         id: nanoid(),
      //         content: code,
      //         type: 'Dynamic',
      //         createdAt: new Date()
      //       }
      //     })
      //   } catch (e) {
      //     console.log('parse code err:')
      //     console.error(e)
      //   }
      // }
      if (functionCall.name == 'generate_listPage_from_code') {
        try {

          // 使用正则表达式替换所有反引号为双引号
          const args = parseJSON(functionCall.arguments || '{}')
          
          const code = args.code
          console.log('!!!!!!!!!!code!!!!!!!!!!\n', code)
          urls = await saveCode(code)
          console.log('!!!!!!!!!!!url!!!!!!!!!!!\n', urls)
          

          // setPageStatus("loaded")
          // operate({
          //   type: 'add',
          //   data: {
          //     id: nanoid(),
          //     content: code,
          //     type: 'Dynamic',
          //     createdAt: new Date()
          //   }
          // })
        } catch (e) {
          console.log('parse code err:')
          console.error(e)
        }
      }
      if (functionCall.name == 'generate_formPage_from_code') {
        try {

          // 使用正则表达式替换所有反引号为双引号
          const args = parseJSON(functionCall.arguments || '{}')
          
          const code = args.code

          console.log('!!!!!!!!!!code!!!!!!!!!!\n', code)
          urls = await saveCode(code)
          console.log('!!!!!!!!!!!urls!!!!!!!!!!!\n', urls)
          

          // setPageStatus("loaded")
          // operate({
          //   type: 'add',
          //   data: {
          //     id: nanoid(),
          //     content: code,
          //     type: 'Dynamic',
          //     createdAt: new Date()
          //   }
          // })
        } catch (e) {
          console.log('parse code err:')
          console.error(e)
        }
      }
      if (functionCall.name == 'generate_detailPages_from_code') {
        try {

          // 使用正则表达式替换所有反引号为双引号
          const args = parseJSON(functionCall.arguments || '{}')
          
          const code = args.code
          const table =await BaseAISDK.getTable()
          const recordIds = await table.getRecordIdList()
          console.log('!!!!!!!!!!code!!!!!!!!!!\n', code)
          urls = await saveCode(code,recordIds)
          console.log('!!!!!!!!!!!urls!!!!!!!!!!!\n', urls)
        
        } catch (e) {
          console.log('parse code err:')
          console.error(e)
        }
      }

      const functionResponse: ChatRequest = {
        messages: [...chatMessages,
        {
          role: 'function' as const,
          content: '生成页面的链接为：' + urls,
          id: nanoid(), createdAt: new Date(),
          name: 'run_javascript_code',
        }]
      }
      console.log('!!!!!!!!!!EXPERIMENTALCALL MESSAGES!!!!!!!!',functionResponse.messages)
      return functionResponse

    }
  })
  // 父agent调用子agent的函数
  const handleCall: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    console.log(
      ` pageCreator agent is called:\n
      ${JSON.stringify(
        {
          functionCall,
          chatMessages
        },
        null,
        2
      )}`
    )
    // setPageStatus("loading")
    const curDetailData = await BaseAISDK.getCurDetailData()
    const curListData = await BaseAISDK.getCurListData()
    //TODO:调整prompt使得生成页面更加美观， 且能适应各种页面
    //TODO:优化
    // const bgPrompt = `
    //   当前的详情数据示例为: ${JSON.stringify(curDetailData, null, 2)}
    //   请你结合这些数据的含义，判断应该强调的信息，以创建不同样式的页面
    // `
    const tableInfo = await BaseAISDK.getTableMetaList();
    const tableInfoList = JSON.stringify(tableInfo, null, 2);
    // const bgPrompt = `
    //     多维表格中所有数据表信息为:\n`
    //   + tableInfoList + `
    //     请调用sdk获取数据，创建各类界面。
    // `
    const bgPrompt = `
    检查用户提供的信息是否足够完成其需求，如果可以实现请调用sdk获取数据，创建各类界面，严格根据用户输入的内容作为输入参数；如果不能实现则把原因返回。
    `
    console.log(`!!!!!!!!!!pageCreator agent--in-progress!!!!!!!!!:\n ${bgPrompt}`)
    const bgMessage = {
      role: 'system',
      content: bgPrompt,
      id: nanoid(),
      createAt: new Date()
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

    await reload()

    console.log(
      `!!!!!!!!!! pageCreator agent result!!!!!!!!!!:\n
      ${JSON.stringify(
        { result: lastMsgRef.current?.content },
        null,
        2
      )}`
    )
    console.log('ccccccchhhhhhhhaaaaattttt all messages in handlecall:\n', ...chatMessages)
    return {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: fnKey,
          role: 'function' as const,
          content: JSON.stringify({
            result: '生成完成', lastMsgRef
          }),
          createdAt: new Date()
        }
      ]
    } as ChatRequest
  }
    ; (handleCall as FunctionCallHandlerWithAssert).assert = (fn: FunctionCall) =>
      fn.name === fnKey
  return handleCall as FunctionCallHandlerWithAssert
}
