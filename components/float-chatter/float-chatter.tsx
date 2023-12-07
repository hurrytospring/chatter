import { cardCompMapping } from './card-render'
import './float-chatter.less'
import { useCardMessageContext } from './message-context'

export function FloatChatter() {
  const { cards } = useCardMessageContext()
  return (
    <div>
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
