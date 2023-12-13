import { ChatRequest, FunctionCall, FunctionCallHandler, type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>


export type FunctionCallHandlerWithAssert=FunctionCallHandler & {assert:(fn:FunctionCall)=>boolean}

export type AgentConfig={
  fnKey:string,
  sysPrompt:string,
  getBgPrompt:()=>Promise<string>,
  outFnDef:Object,
  inFnDef:Object,
  onFunctionCall:(chatMessages:Message[],functionCall:FunctionCall)=>Promise<string>
}