'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { use, useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import { ChatRequest, FunctionCallHandler, nanoid } from 'ai'
import { runCode } from '@/app/code_runner'
import { FieldType, bitable } from '@lark-base-open/js-sdk'
import lodash, { isEqual } from 'lodash'
import { pageCreatorFnDef, usePageCreatorAgent } from '@/lib/hooks/use-page-creator'
import { CardMessageProvider, useCardMessageContext } from '../float-chatter/message-context'
import { FloatChatter } from '../float-chatter/float-chatter'
import { ChatProps } from './types'
import { sysFnDef, useSysAgent } from '@/lib/hooks/use-sys-agent'
import { useUniAgent } from '@/lib/hooks/use-uni-agent'
import { dataAnasisAgentConfig } from '@/lib/hooks/use-data-anasis'
import { CardMessage } from '../float-chatter/types'
import { useStepContext } from '@mui/material'
import { merge, useDebugMode } from './chatUtil'
import { dashboardFnDef, useDashboardAgent } from '@/lib/hooks/use-dashboard-agent'
import { workflowFnDef, useWorkflowAgent } from '@/lib/hooks/use-workflow-agent'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
//TODO：改正这里的bad code
let ignore = false

export function ChatPure({
  id,
  initialMessages,
  className,
  // setPageStatus
}: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const { operate } = useCardMessageContext()
  const pageCreatorAgentHandle = usePageCreatorAgent(operate)
  const sysAgentHandle = useSysAgent(operate)
  const dataAnasisAgentHandle = useUniAgent(dataAnasisAgentConfig)
  const dashboardAgentHandle = useDashboardAgent(operate)
  const workflowAgentHandle = useWorkflowAgent(operate)
  //注意默认隐藏初始信息
  const iniMessageNum = initialMessages?.length || 0
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api: '/api/chat-common',
      initialMessages,
      id,
      body: {
        id,
        previewToken,
        modelConfig: { functions: [pageCreatorFnDef, sysFnDef, dataAnasisAgentConfig.outFnDef, dashboardFnDef, workflowFnDef] }
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
      onFinish() {
        // if (!path.includes('chat')) {
        //   router.push(`/chat/${id}`, { shallow: true })
        //   router.refresh()
        // }
      },
      experimental_onFunctionCall: (chatMessages, functionCall) => {
        console.log('————————calling function————————,', functionCall)
        //设定loading
        const id = nanoid()
        operate({
          type: 'add',
          data: {
            id: id,
            content: functionCall.name,
            type: 'Loading',
            createdAt: new Date()
          }
        })
        let agentResultP: Promise<void | ChatRequest>
        if (pageCreatorAgentHandle.assert(functionCall)) {
          agentResultP = pageCreatorAgentHandle(chatMessages, functionCall)
        } else if (sysAgentHandle.assert(functionCall)) {
          agentResultP = sysAgentHandle(chatMessages, functionCall)
        } else if (dataAnasisAgentHandle.assert(functionCall)) {
          agentResultP = dataAnasisAgentHandle(chatMessages, functionCall)
        } else if (dashboardAgentHandle.assert(functionCall)) {
          agentResultP = dashboardAgentHandle(chatMessages, functionCall)
        } else if (workflowAgentHandle.assert(functionCall)) {
          agentResultP = workflowAgentHandle(chatMessages, functionCall)
        } else {
          agentResultP = new Promise(() => { })
        }
        //这里要把消息update上去实在是不方便，就把loading隐藏了吧
        agentResultP.then((chRe: void | ChatRequest) => {
          operate({
            type: 'update',
            data: {
              id: id,
              hidden: true
            }
          })
        })
        return agentResultP
      }
    })
  const [displayMessages, setDisplayMessages] = useState<CardMessage[]>([])
  const ctx = useCardMessageContext()
  const useCompare = (value: any, compare: (v1: any, v2: any) => boolean) => {
    const ref = useRef(null)
    if (!compare(value, ref.current)) {
      ref.current = value
    }
    return ref.current
  }
  const { debugMode } = useDebugMode()
  const deps = [
    useCompare(messages, isEqual),
    useCompare(ctx.cards, isEqual),
    debugMode
  ]

  useEffect(() => {
    setDisplayMessages(merge(messages, ctx.cards, debugMode, operate))
    console.log('displayMessages', displayMessages)
    console.log('messages', messages)
    console.log('debugMode', debugMode)
  }, deps)
  //TODO:搞定这里的多次提醒问题
  useEffect(() => {
    if (!ignore) {
      operate({
        type: 'add',
        data: {
          id: '1',
          type: 'Chat',
          //TODO：搞清这里怎么换行
          content: `您好，这里是Chatter插件，可以用来进行系统搭建，页面生成，数据分析等功能
          您可以试着发出以下指令：
          创建一个招聘系统，给出相关方案
          根据当前记录生成详情页面
          分析所有订单的平均ARR是多少
          `,
          createdAt: new Date()
        }
      })
    }
    ignore = true
  }, [])

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList
              messages={displayMessages}
              hiddenMessageNum={iniMessageNum}
            />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{' '}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{' '}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput)
                setPreviewTokenDialog(false)
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
