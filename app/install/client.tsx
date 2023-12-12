'use client'

import { useRouter } from 'next/navigation'
import { bitable } from '@lark-base-open/js-sdk'
import Form, { useForm } from 'antd/es/form/Form'
import Input from 'antd/es/input/Input'
import FormItem from 'antd/es/form/FormItem'
import { getAuthMeta, install, IOpenSessionData } from '../actions'
import { useEffect, useRef, useState } from 'react'
import { Spin } from 'antd'
import { useMessage } from '@/lib/hooks/useMessage'
import { Button } from '@/components/ui/button'

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
  const [messageApi, contextHolder] = useMessage()
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
  const [form] = useForm<IOpenSessionData>()

  const handleSaveAuthMeta = async () => {
    const meta = await form.validateFields()
    // const meta = form.getFieldsValue()
    try {
      const userId = await bitable.bridge.getUserId()
      const selection = await bitable.base.getSelection()
      const baseId = selection?.baseId || ''
      if (!baseId || !userId || !meta.appToken || !meta.personalBaseToken) {
        messageApi.error({
          content: `缺少参数${JSON.stringify({ baseId, userId })}`
        })
        throw new Error(`缺少参数`)
      }
      const result = await install({
        ...meta,
        baseId,
        userId
      })
      messageApi.success({ content: '安装成功' })
      router.replace('/')
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
      <Form<IOpenSessionData> form={form}>
        <FormItem
          name="appToken"
          label="token"
          rules={[
            {
              required: true,
              message: '必填'
            }
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          name="personalBaseToken"
          label="personalBaseToken"
          rules={[
            {
              required: true,
              message: '必填'
            }
          ]}
        >
          <Input />
        </FormItem>
        <FormItem wrapperCol={{ offset: 8, span: 16 }}>
          <Button onClick={e => handleSaveAuthMeta()} >安装</Button>
        </FormItem>
      </Form>
    </div>
  )
}
