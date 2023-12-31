// import { bitable } from '@lark-base-open/js-sdk'
import { kv } from '@vercel/kv'
// import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { cookieKey } from './lib/utils'

export async function middleware(request: NextRequest) {
  // // Call our authentication function to check the request
  // console.log('request')
  // let meta = null
  // try {
  //   meta = await bitable.base.getSelection()
  // } catch (e) {
  //   console.log('request error', e)
  // }
  // console.log('request sucess')
  // if (!meta) throw new Error('no meta found')
  // const baseId = meta.baseId
  // const authMetaStr = await kv.get(`authMeta:${baseId}`)
  // if (!authMetaStr) {
  //   return NextResponse.rewrite(new URL('/install', request.url))
  // }
  // const baseIdCookie = request.cookies.get(cookieKey)
  // if (!baseIdCookie?.value) {
  //   return NextResponse.redirect(new URL('/install', request.url))
  // }
  return NextResponse.next()
}
export const config = {
  matcher: ['/((?!api|install|_next/static|_next/image|favicon.ico).*)']
}
