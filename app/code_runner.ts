'use client'

import trim from 'lodash-es/trim'

// 定义动态代码字符串
const genStaticCode = (userCode: string, keys: string[]) => {
  const code = trim(userCode, ';')
  return `
  async function asyncOperation(${keys.join(',')}) {
    // 异步操作
   return await (${code})
  }
  // 执行异步操作
  return new Promise((res,rej)=>{
    asyncOperation(${keys.join(
      ','
    )}).then(value=>{console.log('rrrrrr',value);res(value)}).catch(e=>{console.log('eeeeeeee',e);rej(e)})
  }) 
`
}

export async function runCode(userCode: string, ctx: Record<string, any>) {
  const keys = Object.keys(ctx)
  const code = genStaticCode(userCode, keys)
  const dynamicFunction = new Function(...keys, code)
  return await dynamicFunction(...keys.map(key => ctx[key]))
}


// 定义动态代码字符串,同步
const genStaticSyncCode = (userCode: string, keys: string[]) => {
  const code = trim(userCode, ';')
  return `
   function asyncOperation(${keys.join(',')}) {
   return  (function (){${code}})()
  }
  return asyncOperation(${keys.join(
    ','
  )})
`
}
export async function runCodeSync(userCode: string, ctx: Record<string, any>) {
  const keys = Object.keys(ctx)
  const code = genStaticSyncCode(userCode, keys)
  console.log(1111,code)
  const dynamicFunction = new Function(...keys, code)
  console.log('ctxxxxx',keys.map(key => ctx[key]))
  return await dynamicFunction(...keys.map(key => ctx[key]))
}
