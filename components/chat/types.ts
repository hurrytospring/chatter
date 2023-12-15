import { Message } from "ai"

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string,
    setPageStatus:(status:string)=>void
  }