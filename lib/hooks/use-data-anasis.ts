import { AgentConfig } from '../types'
import dataPrompt from '@/prompt/base_data_ana_plugin.md'
import { FieldType, ITable, bitable } from '@lark-base-open/js-sdk'
import { BaseAISDK } from '../base-ai-sdk/base-ai-sdk'
import { runCodeSync, runCodeSyncNoPage } from '@/app/code_runner'

export const dataAnasisAgentConfig: AgentConfig = {
  fnKey: 'data-anasis',
  sysPrompt: dataPrompt,
  getBgPrompt: async () => {
    let data = await BaseAISDK.getCurListData()
    console.log(data)
    data.rows = data.rows.slice(0, 2)
    const prompt = `
    用户的表格的数据存储在data对象中
    data的一个例子为 'const data = ${JSON.stringify(data)}'
    其中header表示字段， rows表示具体数据
    按照用户的要求分析数据,并返回用户需要的result。注意code参数必须是json形式
  `
    // console.log('bgPrompt', prompt)
    return prompt
  },
  outFnDef: {
    name: 'data-anasis',
    description: '对base的字段和记录进行各类的数据分析',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '一段话，描述要对字段和记录进行什么样的分析'
        }
      },
      required: ['content']
    }
  },
  inFnDef: {
    name: 'gen_data_anasis_code',
    description:
      '用户要求进行数据分析时，生成analyze函数，使其可以对用户的base表格的data对象进行分析，注意code必须是json形式',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'javascript code that analyze code'
        }
      },
      required: ['code']
    }
  },
  onFunctionCall: async (chatMessages, functionCall) => {
    console.log('ana function Call', functionCall)
    let result: string = ''
    let data = await BaseAISDK.getCurListData()
    try {
      const code: string = JSON.parse(functionCall.arguments || `{}`).code || ''
      console.log('ana call code\n', code)
      result = runCodeSyncNoPage(code, {data})
      console.log("result",result)
    } catch (e) {
      result = '生成失败'
      console.log('err', e)
    }
    return result
  }
}
