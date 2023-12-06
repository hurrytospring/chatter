import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { auth } from '@/install'
import { nanoid } from '@/lib/utils'
import { kv } from '@vercel/kv'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()

  const { messages, previewToken, functions } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  console.log('previewToken', previewToken)
  if (previewToken) {
    openai.apiKey = previewToken
  }
  const res = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages,
    temperature: 0.7,
    stream: true,
    functions
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    },
    // experimental_onFunctionCall: async (
    //   { name, arguments: args },
    //   createFunctionCallMessages,
    // ) => {
    //   // if you skip the function call and return nothing, the `function_call`
    //   // message will be sent to the client for it to handle
    //   if (name === 'get_current_weather') {
    //     // Call a weather API here
    //     const weatherData = {
    //       temperature: 20,
    //       unit: args.format === 'celsius' ? 'C' : 'F',
    //     };
    //     // `createFunctionCallMessages` constructs the relevant "assistant" and "function" messages for you
    //     const newMessages = createFunctionCallMessages(weatherData);
    //     return openai.chat.completions.create({
    //       messages: [...messages, ...newMessages],
    //       stream: true,
    //       model: 'gpt-4-1106-preview',
    //       // see "Recursive Function Calls" below
    //       functions,
    //     });
    //   }
    // },
  })

  return new StreamingTextResponse(stream)
}
