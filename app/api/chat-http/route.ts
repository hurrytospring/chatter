import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { auth } from '@/install'
import { nanoid } from '@/lib/utils'
import { kv } from '@vercel/kv'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai-proxy.org/v1'
})

export async function POST(req: Request) {
  const json = await req.json()

  const { messages, previewToken, modelConfig = {} } = json
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
    //gpt-4-1106-preview
    model: 'gpt-3.5-turbo-16k',
    messages,
    temperature: 0.7,
    stream: false,
    ...modelConfig
  })
  //TODO:暂时搁置类型问题（这还是官方的）
  //@ts-ignore
  return res.choices
}
