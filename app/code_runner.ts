'use client'

import trim from 'lodash-es/trim'

// 定义动态代码字符串
const genStaticCode = (userCode: string, keys: string[]) => {
  const code = trim(userCode, ';')
  return `
  async function asyncOperation(${keys.join(',')}) {
    // 异步操作
   return await (async ()=>{
    return (${code})
   })()
  }
  // 执行异步操作
  return new Promise((res,rej)=>{
    asyncOperation(${keys.join(',')})
    .then(value=>{console.log('rrrrrr',value);res(value)}).catch(e=>{console.log('eeeeeeee',e);rej(e)})
  }) 
`
}

export async function runCode(userCode: string, ctx: Record<string, any>) {
  const keys = Object.keys(ctx)
  const code = genStaticCode(userCode, keys)
  console.log("--------------code--------------")
  console.log(code)
  console.log("--------------keys----------------")
  console.log(keys)
  const dynamicFunction = new Function(...keys, code)
  return await dynamicFunction(...keys.map(key => ctx[key]))
}

// 定义动态代码字符串,同步
const genStaticSyncCode = (userCode: string, keys: string[]) => {
  const code = trim(userCode, ';')
  return `
  function syncOperation(${keys.join(',')}) {
   ${code}
  const comp=React.createElement(Comp);
  return comp;  
 }
 return syncOperation(${keys.join(',')})
`
//   return `
//    function syncOperation(${keys.join(',')}) {
//    const comp=React.createElement((function (){${code}})());
//    return comp;  
//   }
//   return syncOperation(${keys.join(',')})
// `
  //   return `
  //    function syncOperation(${keys.join(',')}) {
  //    const comp=React.createElement((function (){${code}})());
  //    return comp;
  //   }
  //   return syncOperation(${keys.join(
  //     ','
  //   )})
  // `
}
export function runCodeSync(userCode: string, ctx: Record<string, any>) {
  const keys = Object.keys(ctx)
  const code = genStaticSyncCode(userCode, keys)
  // console.log(new String(code).toString())
  const dynamicFunction = new Function(...keys, code)
  // console.log(
  //   'ctxxxxx',
  //   keys.map(key => ctx[key])
  // )
  try {
    //错误处理
    const result = dynamicFunction(...keys.map(key => ctx[key]))
    // console.log('runCodeResult', result)
    return result
  } catch (e) {
    //TODO：增加更多的错误处理逻辑
    console.log('runCodeErr', e)
  }
}

export function runCodeSyncNoPage(userCode: string, ctx: Record<string, any>) {
  const keys = Object.keys(ctx)
  // const code = genStaticSyncCode(userCode, keys)
  const code = `
  function syncOperation(${keys.join(',')}){
    ${userCode} 
    return analyze(data)
  }
  return syncOperation(${keys.join(',')})
  `
  console.log(new String(code).toString())
  const dynamicFunction = new Function(...keys, code)
  console.log(
    'ctxxxxx',
    keys.map(key => ctx[key])
  )
  try {
    //错误处理
    const result = dynamicFunction(...keys.map(key => ctx[key]))
    console.log('runCodeResult', result)
    return result
  } catch (e) {
    //TODO：增加更多的错误处理逻辑
    console.log('runCodeErr', e)
  }
}
