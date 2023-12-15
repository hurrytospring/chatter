'use client'

import * as React from 'react'
import { logout } from '@/app/actions'
import { Button } from '@/components/ui/button'

import { bitable } from '@lark-base-open/js-sdk'
import { useMessage } from '@/lib/hooks/useMessage'
import { useRouter } from 'next/navigation'
import { Switch } from './ui/switch'
import { useDebugMode } from './chat/chatUtil'

export function Header() {
  const [message] = useMessage()
  const router = useRouter()
  const handleLogout = async () => {
    const selection = await bitable.base.getSelection()
    const baseId = selection.baseId
    if (!baseId) {
      message.success('退出登录失败')
      return
    }
    logout(baseId)
    message.success('退出登录成功')
    router.replace('/install')
  }
  const { setDebugMode } = useDebugMode()
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-8 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        {/* <Button onClick={e => handleLogout()}>登出</Button> */}
      </div>
      <div className="flex items-center justify-end space-x-2">
        <span className="">debug</span>
        <Switch
          defaultChecked={true}
          onCheckedChange={v => {
            if (v) {
              setDebugMode('debug')
            } else {
              setDebugMode('normal')
            }
          }}
        ></Switch>
      </div>
    </header>
  )
}
