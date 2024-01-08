'use client'

import trim from 'lodash-es/trim'

const ctx: Record<string, any> = { }
const keys = Object.keys(ctx)
// 定义动态代码字符串
const genStaticCode = (userCode: string) => {
  const code = trim(userCode, ';')
  return `
  async function asyncOperation(${keys.join(',')}) {
    // 异步操作
   return await (${code})
  }
  // 执行异步操作
  return new Promise((res,rej)=>{
    asyncOperation(${keys.join(',')}).then(value=>{console.log('rrrrrr',value);res(value)}).catch(e=>{console.log('eeeeeeee',e);rej(e)})
  }) 
`
}

async function runCode(userCode: string) {
  const code = genStaticCode(userCode)
  const dynamicFunction = new Function(...keys, code)
  return await dynamicFunction(...keys.map(key => ctx[key]))
}

async function executeFn(id:string,fn:string) {
    // await getCodeById

    const fns=await runCode('beCode');
    return fns['fn']()

}