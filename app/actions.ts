'use server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { auth } from '@/install'
import { type Chat } from '@/lib/types'
import { cookieKey } from '@/lib/utils'
import memoize from 'lodash-es/memoize'

import { BaseClient } from '@lark-base-open/node-sdk'

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
export async function getAuthMetaById(baseId: string) {
  const authMeta: IOpenSessionData | null = await kv.get(`authMeta:${baseId}`)
  console.log('mmmmmmmmmmmmeta',authMeta)
  if (authMeta && authMeta.appToken && authMeta.personalBaseToken) {
    return authMeta
  }
  return null
}
const getAuthMetaById_memo = memoize(getAuthMetaById)

export async function getAuthMeta(): Promise<IOpenSessionData | null> {
  // return {
  //   appToken: 'string',
  //   personalBaseToken: 'string',
  //   baseId: 'string',
  //   userId: 'userId222'
  // }
  const baseIdCookie = cookies().get(cookieKey)
  console.log('!!!!!!!!!!!!baseId', baseIdCookie)
  if (!baseIdCookie?.value) return null
  const baseId = baseIdCookie?.value
  return getAuthMetaById_memo(baseId || '')

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

export async function getTableData_page(tableName: string) {
  const meta = await getAuthMeta();
  if (!meta?.personalBaseToken) throw new Error('no auth');
  const { appToken, personalBaseToken } = meta;
  const client = new BaseClient({
    appToken: appToken,
    personalBaseToken: personalBaseToken
  });
  const tableList = (await client.base.appTable.list()).data?.items
  if (tableList == undefined) throw new Error('no tables')
  const table = tableList.find(table => table.name === tableName);
  if (table == undefined) throw new Error('given tableName not exist')
  const tableId = table.table_id
  if (tableId == undefined) throw new Error('table has no id')
  // 列出数据表字段
  const fieldData = (await client.base.appTableField.list({
    path: {
      table_id: tableId
    }
  })).data?.items

  // 列出数据表记录
  const recordData = (await client.base.appTableRecord.list({
    path: {
      table_id: tableId
    },
  })).data?.items

  console.log('ooooooooooone page fielData\n', fieldData)
  console.log('ooooooooooone page recordData\n', recordData)
  return recordData
}

export async function getDetailData_page(tableName: string, recordId: string) {
  const meta = await getAuthMeta();
  if (!meta?.personalBaseToken) throw new Error('no auth');
  const { appToken, personalBaseToken } = meta;
  const client = new BaseClient({
    appToken: appToken,
    personalBaseToken: personalBaseToken
  });
  const tableList = (await client.base.appTable.list()).data?.items
  if (tableList == undefined) throw new Error('no tables')
  const table = tableList.find(table => table.name === tableName);
  if (table == undefined) throw new Error('given tableName not exist')
  const tableId = table.table_id
  if (tableId == undefined) throw new Error('table has no id')
  // 列出数据表字段
  const fieldData = (await client.base.appTableField.list({
    path: {
      table_id: tableId
    }
  })).data?.items

  const recordData = (await client.base.appTableRecord.list({
    path: {
      table_id: tableId
    }
  })).data?.items
  if (recordData == undefined) throw Error('record has no data.')
  return recordData
}

export async function getFormData_page(tableName: string) {
  const meta = await getAuthMeta();
  if (!meta?.personalBaseToken) throw new Error('no auth');
  const { appToken, personalBaseToken } = meta;
  const client = new BaseClient({
    appToken: appToken,
    personalBaseToken: personalBaseToken
  });
  const tableList = (await client.base.appTable.list()).data?.items
  if (tableList == undefined) throw new Error('no tables')
  const table = tableList.find(table => table.name === tableName);
  if (table == undefined) throw new Error('given tableName not exist')
  const tableId = table.table_id
  if (tableId == undefined) throw new Error('table has no id')
  // 列出数据表字段
  const fieldData = (await client.base.appTableField.list({
    path: {
      table_id: tableId
    }
  })).data?.items
  return fieldData
}


export async function getFieldsData_page(tableName: string) {
  const meta = await getAuthMeta();
  if (!meta?.personalBaseToken) throw new Error('no auth');
  const { appToken, personalBaseToken } = meta;
  const client = new BaseClient({
    appToken: appToken,
    personalBaseToken: personalBaseToken
  });
  const tableList = (await client.base.appTable.list()).data?.items
  if (tableList == undefined) throw new Error('no tables')
  const table = tableList.find(table => table.name === tableName);
  if (table == undefined) throw new Error('given tableName not exist')
  const tableId = table.table_id
  if (tableId == undefined) throw new Error('table has no id')
  // 列出数据表字段
  const fieldsData = (await client.base.appTableField.list({
    path: {
      table_id: tableId
    }
  })).data?.items
  if (fieldsData == undefined) throw Error('table has no fields.')
  return fieldsData
}

export async function getRecordsData_page(tableName: string) {
  const meta = await getAuthMeta();
  if (!meta?.personalBaseToken) throw new Error('no auth');
  const { appToken, personalBaseToken } = meta;
  const client = new BaseClient({
    appToken: appToken,
    personalBaseToken: personalBaseToken
  });
  const tableList = (await client.base.appTable.list()).data?.items
  if (tableList == undefined) throw new Error('no tables')
  const table = tableList.find(table => table.name === tableName);
  if (table == undefined) throw new Error('given tableName not exist')
  const tableId = table.table_id
  if (tableId == undefined) throw new Error('table has no id')


  const recordsData = (await client.base.appTableRecord.list({
    path: {
      table_id: tableId
    }
  })).data?.items
  if (recordsData == undefined) throw Error('record has no data.')
  return recordsData
}

export async function getCode(uuid: string) {
  console.log("uuid:", uuid);
  if (uuid == null) throw Error('no uuid!')
  const code = await kv.hmget(uuid, 'code')
  if (code == null) throw Error('no code!')
  return code['code']
}