"use client"

import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { Message } from 'ai'
import plugin_prompt from '@/prompt/base_open_plugin.md'
import { useEffect, useState } from 'react'
import  CircularProgress from '@mui/material/CircularProgress';
import { bitable } from '@lark-base-open/js-sdk'

async function getInitPrompt() {
  const table = await bitable.base.getActiveTable()
  const metaList = await table.getFieldMetaList()
  return  JSON.stringify(metaList);
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
      role: 'system'
    },
    {
      id: nanoid(),
      content:`当前表结构为：${initCtx}, 其中含有用户字段名，id等信息，你在生成代码时，可以结合用户输入从其中直接获取一些值，作为常量使用` ,
      role: 'system'
    }
  ]
  if (loading) return <CircularProgress />
  return <Chat id={id} initialMessages={message} />
}
