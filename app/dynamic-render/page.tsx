'use client'

import * as MUI from '@mui/material'
import { runCodeSync } from '../code_runner'
import React, { useEffect, useState } from 'react'
import { kv } from '@vercel/kv'
import { URLSearchParams } from 'next/dist/compiled/@edge-runtime/primitives/url'
import { getCode, getDetailData_page, getFormData_page, getListData_page } from 'app/actions'
import { useParams, useSearchParams } from 'next/navigation'
import { BaseAISDK } from '@/lib/base-ai-sdk/base-ai-sdk'

async function run() {
    return runCodeSync(await getCode('') as string, { MUI, React })
}

function DynamicRender() {
    // redirect to home if user is already logged in
    const searchParams = useSearchParams()
    const uuid = searchParams.get('uuid') || ''
    const recordId = searchParams.get('recordid')
    const [loading, setLoading] = useState(true)
    const [code, setCode] = useState('')
    useEffect(() => {
        getCode(uuid).then(c => {
            setCode(c);
            console.log('fetched-code------', c, uuid)
            // console.log("Babel", Babel)
            setLoading(false);
        })

    }, [])


    if (loading) return null;
    //@ts-ignore
    const jsCode = Babel.transform(code, { presets: ["react"] }).code;
    // console.log("transformCode",jsCode)

    return runCodeSync(jsCode, { MUI, React, recordId, BaseAISDK })
}

const DynamicRenderPage = DynamicRender
export default DynamicRenderPage;
