'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { auth } from '@/install'
import { type Chat } from '@/lib/types'
import { cookieKey } from '@/lib/utils'
import memoize from 'lodash-es/memoize'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  const uid = await kv.hget<string>(`chat:${id}`, 'userId')

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${session.user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(chat: Chat) {
  const session = await auth()

  if (!session?.user?.id || session.user.id !== chat.userId) {
    return {
      error: 'Unauthorized'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export interface IOpenSessionData {
  appToken: string
  personalBaseToken: string
  baseId: string
  userId: string
}
async function getAuthMetaById(baseId:string){
  const authMeta: IOpenSessionData | null = await kv.get(`authMeta:${baseId}`)

  if (authMeta && authMeta.appToken && authMeta.personalBaseToken) {
    return authMeta
  }
  return null
}
const getAuthMetaById_memo=memoize(getAuthMetaById)

export async function getAuthMeta(): Promise<IOpenSessionData | null> {
  const baseIdCookie = cookies().get(cookieKey)
  if (!baseIdCookie?.value) return null
  const baseId = baseIdCookie.value
  return getAuthMetaById_memo(baseId)

}

export async function install(data: IOpenSessionData) {
  await kv.set(`authMeta:${data.baseId}`, JSON.stringify(data))
  cookies().set({
    name: cookieKey,
    value: data.baseId,
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true
  })
  return cookies().toString()
}
export async function logout(key: string) {
  await kv.del(`authMeta:${key}`)
  cookies().set({
    name: cookieKey,
    value: '',
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true
  })
  return cookies().toString()
}
