'use client'

import { redirect, useRouter } from 'next/navigation'
import { bitable } from '@lark-base-open/js-sdk'
import Form from 'antd/es/form/Form'
import Input from 'antd/es/input/Input'
import Button from 'antd/es/button'
import FormItem from 'antd/es/form/FormItem'
import message from 'antd/es/message'
import { getAuthMeta, install, IOpenSessionData } from '../actions'
import { useEffect, useRef, useState } from 'react'
import { Spin } from 'antd'

async function auth() {
  const meta = await bitable.base.getSelection()
  const baseId = meta.baseId
  if (!baseId) {
    return null
  }
  const authMeta = await getAuthMeta()
  if (baseId !== authMeta?.baseId) {
    return null
  }

  return authMeta
}

export default function InstallPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const router = useRouter()
  useEffect(() => {
    auth().then(authMeta => {
      console.log('authMeta', authMeta)
      if (authMeta) {
        router.replace('/')
        return
      }
      bitable.base.getSelection().then(meta => {
        setLoading(false)
      })
    })
  }, [])
  const handleSaveAuthMeta = async (meta: IOpenSessionData) => {
    try {
      const userId = await bitable.bridge.getUserId()
      const selection = await bitable.base.getSelection()
      const baseId=selection?.baseId||'';
      if(!baseId||!userId) {
        messageApi.error({
            content:`缺少参数${JSON.stringify({baseId,userId})}`
        })
        throw new Error(`缺少参数`)
      }
      const result = await install({
        ...meta,
        baseId,
        userId
      })
      messageApi.success({ content: '安装成功' })
      await new Promise((res, rej) => {
        setTimeout(() => {
          res(1)
        }, 3000)
      })
      redirect('/')
    } catch (e) {
      messageApi.error({
        content: '安装失败'
      })
      console.error(e)
    }
  }
  if (!isClient) {
    return <div>ssr 为空</div> // 在服务器端返回空内容
  }
  if (loading) {
    return <Spin /> // 正在安装时展示 loading 效果
  }
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
      <Form<IOpenSessionData> onFinish={handleSaveAuthMeta}>
        <FormItem name="appToken" label="token" required>
          <Input />
        </FormItem>
        <FormItem name="personalBaseToken" label="personalBaseToken" required>
          <Input />
        </FormItem>
        <FormItem wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            安装
          </Button>
        </FormItem>
      </Form>
    </div>
  )
}
