import clsx from 'clsx';
import { cardCompMapping } from './custom-code-block'
import './float-chatter.less'
import { useCardMessageContext } from './message-context'



interface IFloatChatterProps{
  className?:string;
}
export function FloatChatter(props:IFloatChatterProps) {
  const {className}=props;
  const { cards } = useCardMessageContext()
  console.log('999999',cards)
  return (
    <div className={clsx('float-chatter',className)}>
      {cards.map(c => {
        const Comp = cardCompMapping[c.type] || cardCompMapping.Default
        return (
          <div key={c.id}>
            <Comp card={c} />
          </div>
        )
      })}
    </div>
  )
}
