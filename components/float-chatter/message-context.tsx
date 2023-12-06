import React, { createContext, useContext, useEffect, useState } from 'react'
import { BehaviorSubject } from 'rxjs'

interface CardMessage {
  id: string
  time: number
  type: string
  sender: string
  content: any
  status: 'pending' | 'done'
}
interface Operation {
  type: 'add' | 'update'
  data: Partial<CardMessage>
}

interface ContextValue {
  cards: CardMessage[]
  operate: (op: Operation) => void
}

const initialCardMessages: CardMessage[] = [] // 初始卡片列表为空

const Context = createContext<ContextValue | undefined>(undefined)

export const useCardMessageContext = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error(
      'useCardMessageContext must be used within a CardMessageProvider'
    )
  }
  return context
}

export const CardMessageProvider: React.FC = ({ children }) => {
  const [cardList, setCardMessageList] =
    useState<CardMessage[]>(initialCardMessages)
  const operate = (operation: Operation) => {
    setCardMessageList(list => {
      if (operation.type === 'update') {
        const updatedCardMessages = list.map(card => {
          if (card.id === operation.data.id && card.status !== 'done') {
            return { ...card, ...operation.data }
          }
          return card
        })
        return updatedCardMessages
      }
      if (operation.type === 'add') {
        return [...list, operation.data]
      }
      return list
    })
  }

  return (
    <Context.Provider value={{ cards: cardList, operate }}>
      {children}
    </Context.Provider>
  )
}
