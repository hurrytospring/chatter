"use client"

import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { Message } from 'ai'
import plugin_prompt from '@/prompt/base_main.md'
import { useEffect, useState } from 'react'
import  CircularProgress from '@mui/material/CircularProgress';
import { bitable } from '@lark-base-open/js-sdk'
import { BaseAISDK } from '@/lib/base-ai-sdk/base-ai-sdk'
import Script from 'next/script'

async function getInitPrompt() {
  const table = await bitable.base.getActiveTable()
  const metaList = await table.getFieldMetaList()
  const tableList = await BaseAISDK.getTableMetaList()
  // const newList = metaList.map(obj=>{return  {id:obj.id,name:obj.name}})
  const newList = tableList.map(obj=>{return  {id:obj.id,name:obj.name}})
  return  JSON.stringify(newList);
}
export default function IndexPage() {
  const id = nanoid()
  const [loading, setLoading] = useState(true)
  const [initCtx, setInitCtx] = useState('')
  useEffect(() => {
    getInitPrompt().then(p => {
      setInitCtx(p)
      setLoading(false)
    })
  }, [])
  const message: Message[] = [
    {
      id: nanoid(),
      content: plugin_prompt,
      role: 'system',
      createdAt:new Date()
    },

    {
      id: nanoid(),
      content:`当前多维表格中包括的数据表信息为：${initCtx}, 其中含有数据表名，id等信息，请你根据它推测用户的需求，并给出更具体的任务描述` ,
      // content:`当前表结构为：${initCtx}, 其中含有用户字段名，id等信息，请你根据它推测用户的需求，并给出更具体的任务描述` ,
      role: 'system',
      createdAt:new Date()
    }
  ]
  if (loading) return <CircularProgress />
  //TODO:用更好的方式处理这里的type相关
  return <>
        <Chat id={id} initialMessages={message} setPageStatus={()=>{}}/>

  </>
}
