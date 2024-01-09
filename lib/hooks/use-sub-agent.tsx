import { useCardMessageContext } from '@/components/float-chatter/message-context'
import { pageCreatorFnDef, usePageCreatorAgent } from './use-page-creator'
import { sysFnDef, useSysAgent } from './use-sys-agent'
import { useUniAgent } from './use-uni-agent'
import { dashboardFnDef, useDashboardAgent } from './use-dashboard-agent'
import { dataAnasisAgentConfig } from './use-data-anasis'
import { ChatRequest, FunctionCall, FunctionCallHandler, Message } from 'ai'
import { SubAgentType } from '@/components/float-chatter/custom-code-block/loading-render'
import { useWorkflowAgent, workflowFnDef } from './use-workflow-agent'

type IMayBeFunctionCall = (
  chatMessages: Message[],
  functionCall: FunctionCall
) => { matchFunction: string; callResult: Promise<ChatRequest | void> } | null

const functions = [
  pageCreatorFnDef,
  sysFnDef,
  dataAnasisAgentConfig.outFnDef,
  dashboardFnDef,
  workflowFnDef
]
export function useSubAgent() {
  const { operate } = useCardMessageContext()
  const pageCreatorAgentHandle = usePageCreatorAgent(operate)
  const sysAgentHandle = useSysAgent(operate)
  const dataAnasisAgentHandle = useUniAgent(dataAnasisAgentConfig)
  const dashboardAgentHandle = useDashboardAgent(operate)
  const workflowAgentHandle = useWorkflowAgent(operate)
  const callHandler: IMayBeFunctionCall = (chatMessages, functionCall) => {
    let agentResultP: Promise<void | ChatRequest>
    let matchFunction = functionCall.name || ''
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
      return null
    }

    return { matchFunction, callResult: agentResultP }
  }
  return {
    functions,
    callHandler
  }
}

export const MappingsFunction2LoadingMessageType: Record<string, SubAgentType> =
  {
    [pageCreatorFnDef.name]: 'PAGE_CREATOR',
    [sysFnDef.name]: 'SYS_CREATOR',
    [dataAnasisAgentConfig.outFnDef.name]: 'DATA_ANA',
    [dashboardFnDef.name]: 'DASHBOARD_CREATOR'
  }
