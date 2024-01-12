'use client'

import { useChat } from 'ai/react'

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
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import { ChatRequest, FunctionCallHandler } from 'ai'
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
import { dashboardFnDef, useDashboardAgent } from '@/lib/hooks/use-dashboard-agent'
import { workflowFnDef, useWorkflowAgent } from '@/lib/hooks/use-workflow-agent'

import { Switch } from '@mui/material'
import { merge } from './chatUtil'
import {
  MappingsFunction2LoadingMessageType,
  useSubAgent
} from '@/lib/hooks/use-sub-agent'
import { nanoid } from 'nanoid'
import { Agent } from '@/lib/hooks/baseAgent' 

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
//TODO：改正这里的bad code
let ignore = false

export function ChatPure({
  id,
  initialMessages,
  className // setPageStatus
}: ChatProps) {
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')

  const { callHandler, functions } = useSubAgent()
  //注意默认隐藏初始信息
  const iniMessageNum = initialMessages?.length || 0
  // const { messages, append, reload, stop, isLoading, input, setInput } = new Agent()
  const { messages, append, reload, stop, isLoading, input, setInput } = useChat({
      api: '/api/chat-common',
      initialMessages,
      id,
      body: {
        id,
        previewToken,
        // modelConfig: { functions: [pageCreatorFnDef, sysFnDef, dataAnasisAgentConfig.outFnDef, dashboardFnDef, workflowFnDef] }
        modelConfig: { functions: [...functions] }
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
      onFinish() {},
      experimental_onFunctionCall: (chatMessages, functionCall) => {
        const call = callHandler(chatMessages, functionCall)
        if (!call) throw new Error(`没有匹配到函数，${functionCall.name}`)
        const { matchFunction, callResult } = call
        console.log('————————calling function————————,', functionCall)
        ctx.addLoadingStep({
          type:
            MappingsFunction2LoadingMessageType[functionCall.name ?? ''] ??
            'UNKNOWN',
          id: nanoid(),
          progress: 0
        })
        callResult.then((chRe: void | ChatRequest) => {
          ctx.finishLoadingStep()
        })
        return callResult
      }
    })
  const ctx = useCardMessageContext()
  const [debugMode, setDebugMode] = useState(false)

  const displayMessages = merge(messages, ctx.cards, debugMode)
  window.displayMessages = displayMessages

  return (
    <div className="overflow-scroll" style={{ height: '100vh' }}>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {displayMessages.length ? (
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
      <div className="absolute bottom-10">
        <Switch
          checked={debugMode}
          onChange={(_, v) => setDebugMode(v)}
          aria-label="debugMode"
        ></Switch>
      </div>
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
