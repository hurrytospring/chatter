export const codeRunnerDef = {
  name: 'run_javascript_code',
  description: '执行一段javascript代码，并输出最后结果',
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
export const functions = [codeRunnerDef]
