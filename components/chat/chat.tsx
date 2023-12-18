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
import {
  pageCreatorFnDef,
  usePageCreatorAgent
} from '@/lib/hooks/use-page-creator'
import {
  CardMessageProvider,
  useCardMessageContext
} from '../float-chatter/message-context'
import { FloatChatter } from '../float-chatter/float-chatter'
import { ChatProps } from './types'
import { sysFnDef, useSysAgent } from '@/lib/hooks/use-sys-agent'
import { useUniAgent } from '@/lib/hooks/use-uni-agent'
import { dataAnasisAgentConfig } from '@/lib/hooks/use-data-anasis'
import { CardMessage } from '../float-chatter/types'
import { Switch, useStepContext } from '@mui/material'
import { merge } from './chatUtil'
import {dashboardFnDef,useDashboardAgent} from '@/lib/hooks/use-dashboard-agent'
import { Label } from '@mui/icons-material'

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
        modelConfig: { functions: [pageCreatorFnDef,sysFnDef,dataAnasisAgentConfig.outFnDef,dashboardFnDef] }
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
        }else if(dashboardAgentHandle.assert(functionCall)){
          agentResultP = dashboardAgentHandle(chatMessages,functionCall)
        } else {
          agentResultP = new Promise(() => {})
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
  const ctx = useCardMessageContext()
  const [debugMode,setDebugMode]=useState(false)

  const displayMessages=merge(messages, ctx.cards, debugMode)

  return (
    <div className='overflow-scroll' style={{height:'100vh'}}>
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
      <div  className='absolute bottom-10'>
      <Switch checked={debugMode} onChange={(_,v)=>setDebugMode(v)} aria-label='debugMode'></Switch></div>
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
    </div>
  )
}
