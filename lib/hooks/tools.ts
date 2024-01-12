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

export const workflowFnDef = {
  name: 'add_workflow',
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


export const tableFnDef = {
  name: 'create_base_system',
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

export const pageCreatorFnDef = {
  name: 'create_base_page',
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

export const dashboardFnDef = {
  name: 'create_dashboard',
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

