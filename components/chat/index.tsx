"use client"

import {
  CardMessageProvider,
  useCardMessageContext
} from '../float-chatter/message-context'
// import { FloatChatter } from '../float-chatter/float-chatter'
import { ChatProps } from './types'
import { ChatPure } from './chat'
import { useEffect, useState } from 'react'
import { FloatButton, Modal } from 'antd'
export function Chat(props: ChatProps) {
  // const [showFloat, setShowFloat] = useState(false)
  const [pageStatus, setPageStatus] = useState('no page')
  // const changeShowFloat = () => {
  //   setShowFloat(!showFloat)
  // }
  // // const cardMessageContext = useCardMessageContext()
  // const ModalContent = () => {
  //   switch (pageStatus) {
  //     case 'no page':
  //       return <div>no</div>
  //     case 'loading':
  //       return <div>loading</div>
  //     case 'loaded':
  //       return <FloatChatter className="w-full h-[500px] overflow-scroll" />
  //     default:
  //       return <></>
  //   }
  // }

  return (
    <CardMessageProvider>
      <div className="flex-1">
        {/* <FloatButton
          // style={{ top: '50%' }}
          className='top-[50%]'
          onClick={changeShowFloat}
          tooltip={<div>预览</div>}
          badge={{ dot: pageStatus=="loaded" }}
        ></FloatButton>
        <Modal
          title="Basic Modal"
          open={showFloat}
          onCancel={() => {
            setShowFloat(false)
          }}
          footer={() => {
            return <></>
          }}
        >
          <ModalContent />
        </Modal> */}

        <ChatPure {...props}></ChatPure>
      </div>
    </CardMessageProvider>
  )
}
