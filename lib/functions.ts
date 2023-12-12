export const codeGeneratorDef = {
  name: 'gen_javascript_code',
  description: '生成一段javascript代码，以达成用户期望的操作，注意code必须是json形式',
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
export const functions = [codeGeneratorDef]
