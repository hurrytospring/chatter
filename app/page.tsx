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
  return plugin_prompt.replaceAll(`{{tableSchema}}`, JSON.stringify(metaList))
}
export default function IndexPage() {
  const id = nanoid()
  const [loading, setLoading] = useState(true)
  const [initPrompt, setInitPrompt] = useState('')
  useEffect(() => {
    getInitPrompt().then(p => {
      setInitPrompt(p)
      setLoading(false)
    })
  }, [])
  const message: Message[] = [
    {
      id: nanoid(),
      content: initPrompt,
      role: 'user'
    }
  ]
  if (loading) return <CircularProgress />
  return <Chat id={id} initialMessages={message} />
}
