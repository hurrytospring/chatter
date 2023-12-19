import React, {
  ReactChildren,
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
import { CardMessage, CardMessageType, ContextValue, Operation } from './types'
import {
  ILoadingItemState,
  ILoadingMessage
} from './custom-code-block/loading-render'
import { nanoid } from 'nanoid'

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

export const CardMessageProvider: React.FC<{ children: ReactElement }> = ({
  children
}) => {
  const [cardList, setCardMessageList] =
    useState<CardMessage[]>(initialCardMessages)
  const operate = (operation: Operation) => {
    // @ts-ignore
    //TODO:修正这里的类型问题
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
        console.log(77777, [...list, operation.data])
        return [...list, operation.data]
      }
      return list
    })
  }
  const addLoadingStep = (item: ILoadingItemState) => {
    const curLoadingMsg: ILoadingMessage | undefined = cardList.findLast(
      c => c.type === 'Loading'
    )
    if (curLoadingMsg) {
      operate({
        type: 'update',
        data: {
          ...curLoadingMsg,
          customContent: [...curLoadingMsg.customContent, item]
        }
      })
    } else {
      operate({
        type: 'add',
        data: {
          id: nanoid(),
          type: 'Loading',
          customContent: [item]
        }
      })
    }
  }
  const finishLoadingStep = (id?: string) => {
    const curLoadingMsg: ILoadingMessage | undefined = cardList.findLast(
      c => c.type === 'Loading'
    )
    if (!id&&curLoadingMsg) {
      curLoadingMsg.customContent = (curLoadingMsg?.customContent || []).map(
        c => {
          return { ...c, progress: 100 }
        }
      )
      operate({
        type: 'update',
        data: {
          ...curLoadingMsg
        }
      })
      return
    }
    const curStep = curLoadingMsg?.customContent.findLast(c => c.id === id)
    if (curStep) {
      curStep.progress = 100
      operate({
        type: 'update',
        data: {
          ...curLoadingMsg
        }
      })
    }
  }
  return (
    <Context.Provider
      value={{ cards: cardList, operate, finishLoadingStep, addLoadingStep }}
    >
      {children}
    </Context.Provider>
  )
}
