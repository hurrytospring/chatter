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
  const [isWaittingExternal, setIsWaittingExternal] = useState(false)
  const [loadingSteps, setLoadingSteps] = useState<ILoadingItemState[]>([])
  const addLoadingStep = (item: ILoadingItemState) => {
    setIsWaittingExternal(true)
    setLoadingSteps(s => [...s, item])
  }
  const finishLoadingStep = (id?: string) => {
    if (!id) {
      setIsWaittingExternal(false)
      setLoadingSteps([])
      return
    }
    setLoadingSteps(s =>
      s.map(step => {
        if (step.id === id) {
          step.progress = 100
          return step
        }
        return step
      })
    )
  }
  const loadingMessage: ILoadingMessage = {
    type: 'Loading',
    customContent: loadingSteps,
    id: nanoid(),
    sender: '',
    status: 'pending',
    content: '',
    role: 'assistant',
  }
  const mixedCard: CardMessage[] = [
    ...cardList,
    ...(isWaittingExternal ? [loadingMessage] : [])
  ]
  return (
    <Context.Provider
      value={{ cards: mixedCard, operate, finishLoadingStep, addLoadingStep }}
    >
      {children}
    </Context.Provider>
  )
}
