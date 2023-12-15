import { Message } from 'ai'
import { CardMessage, Operation } from '../float-chatter/types'
import { nanoid } from 'nanoid'
import { useState } from 'react'
let debugMode = 'debug'//暂时先全局，过后优化
export const useDebugMode = () => {
  const setDebugMode = (value:string)=>{
    debugMode = value
  }
  return {debugMode, setDebugMode}
}
export function merge(
  messages: Message[],
  cards: CardMessage[],
  debugMode: string,
  operate: (op: Operation) => void
): CardMessage[] {
  let chatCards = []
  if (debugMode != 'debug') {
    messages = messages.filter(m => m.role == 'user' || (m.role == 'assistant' && m.function_call == undefined))
  }
  chatCards = messages.map(message => {
    let status = ''
    // if (message.function_call) {
    //   //先一律把functionCall当成pending
    //   status = 'pending'
    // } else {
    //   status = 'done'
    // }
    return {
      ...message,
      type: 'Chat',
      sender: '',
      status: status
    } as CardMessage
  })
  const arr: CardMessage[] = [...chatCards, ...cards]
  arr.sort((a, b) => {
    let t1 = a.createdAt?.getTime()
    if (!t1) t1 = 0
    let t2 = b.createdAt?.getTime()
    if (!t2) t2 = 0
    // console.log('time', t1, t2)
    return t1 - t2
  })
  //先用这种垃圾逻辑顶着
  return arr.filter((card, index) => {
    return card.hidden !== true
  })
}
