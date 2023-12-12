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
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import { ChatRequest, FunctionCallHandler, nanoid } from 'ai'
import { runCode } from '@/app/code_runner'
import { FieldType, bitable } from '@lark-base-open/js-sdk'
import lodash from 'lodash'
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

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'

const functionCallHandler: FunctionCallHandler = async (
  chatMessages,
  functionCall
) => {
  console.log('start callllllllll', functionCall)
  if (functionCall.name === 'run_javascript_code') {
    const code = JSON.parse(functionCall.arguments || `{}`).code || ''
    console.log('start callllllllll code', code)

    let result: any = ''
    if (code) {
      try {
        result = await runCode(code, { bitable, FieldType, lodash })
      } catch (e) {
        result = { error: e }
      }
    }
    console.log('end callllllllll', result)

    const functionResponse: ChatRequest = {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: 'run_javascript_code',
          role: 'function' as const,
          content: JSON.stringify({
            result
          })
        }
      ]
    }
    return functionResponse
  }
}
export function ChatPure({ id, initialMessages, className,setPageStatus }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const { operate } = useCardMessageContext()
  const pageCreatorAgentHandle = usePageCreatorAgent(operate,setPageStatus)
  const sysAgentHandle = useSysAgent(operate)
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
        modelConfig: { functions: [pageCreatorFnDef,sysFnDef] }
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
        console.log('calledddddd,', functionCall)
        if (pageCreatorAgentHandle.assert(functionCall)) {
          return pageCreatorAgentHandle(chatMessages, functionCall)
        }else if(sysAgentHandle.assert(functionCall)){
          return sysAgentHandle(chatMessages,functionCall)
        }
        return functionCallHandler(chatMessages, functionCall)
      }
    })

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} hiddenMessageNum = {iniMessageNum}/>
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


