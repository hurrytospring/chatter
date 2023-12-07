import { cardCompMapping } from './custom-code-block'
import './float-chatter.less'
import { useCardMessageContext } from './message-context'

export function FloatChatter() {
  const { cards } = useCardMessageContext()
  console.log('999999',cards)
  return (
    <div className='float-chatter'>
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
