'use client'

import * as MUI from '@mui/material'
import { runCodeSync } from '../code_runner'
import React from 'react'
import { kv } from '@vercel/kv'
import { URLSearchParams } from 'next/dist/compiled/@edge-runtime/primitives/url'

import { getCode, getDetailData_page, getFormData_page, getTableData_page } from 'app/actions'
import { useParams } from 'next/navigation'

async function run() {
    return runCodeSync(await getCode('') as string, { MUI, React })
}

export default function DynamicRender() {
    // redirect to home if user is already logged in
    const { uuid } = useParams()
    if (Array.isArray(uuid)) throw Error('exist more than one uuid')
    const code = String(getCode(uuid))
    

    return runCodeSync(code, { MUI, React,getDetailData_page,getTableData_page,getFormData_page })
}
