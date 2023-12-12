import React, { ReactChildren, ReactElement, createContext, useContext, useEffect, useState } from 'react'
import { CardMessage, CardMessageType, ContextValue, Operation } from './types'



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

export const CardMessageProvider: React.FC<{children:ReactElement}> = ({ children }) => {
  const [cardList, setCardMessageList] =
    useState<CardMessage[]>(initialCardMessages)
    console.log(88888,cardList)
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
        console.log(77777,[...list, operation.data])
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
