
export const codeGeneratorDef = {
  name: 'gen_javascript_code',
  description:
    '生成一段javascript代码，以达成用户期望的操作，注意code必须是json形式',
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

export const rejectDef = {
  name: 'gen_reject_reason',
  description:
    '给出无法生成代码的原因，一般来说是输入的参数无法与数据表和字段的元数据中匹配',
  parameters: {
    type: 'object',
    properties: {
      judgement: {
        type: 'string',
        description: 'the reason why system can not generate code to complete user needs.'
      }
    },
    required: ['judgement']
  }
}

export const jsonGeneratorDef = {
  name: 'gen_subtasks',
  description:
    '根据给定的自动化流程，分析其依赖关系并拆解成几个子任务，子任务用生成一段json的方式实现。',
  parameters: {
    type: 'object',
    properties: {
      data: {
        type: 'string',
        description: 'json data'
      }
    },
    required: ['data']
  }
}

export const functions = [codeGeneratorDef,jsonGeneratorDef]
//TODO: 
