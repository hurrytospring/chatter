import * as MUI from '@mui/material'
import React, { FunctionComponent, ReactNode } from 'react'
import WebIcon from '@mui/icons-material/Web';
import AddchartIcon from '@mui/icons-material/Addchart';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import { CardMessage } from '../types'
import { LinearProgress } from '@mui/material';

export interface ILoadingMessage extends CardMessage<ILoadingItemState[]>{
}
interface IChatRenderProps {
  card: ILoadingMessage
  options?: Record<string, any>
}

type SubAgentType='DATA_ANA'|'UNKNOWN'|'PAGE_CREATOR'|'DASHBOARD_CREATOR';
interface SubAgentConfig{
  icon:ReactNode,
  title:string,
  type:SubAgentType
}
export interface ILoadingItemState {
  id:string,
  type:SubAgentType,
  progress:number
}

const SubAgentLoadingConfigs:Record<SubAgentType,SubAgentConfig>={
  'DATA_ANA':{
    icon:<QueryStatsIcon/>,
    title:'数据分析',
    type:'DATA_ANA'
  },
  'UNKNOWN':{
    icon:<DeviceUnknownIcon/>,
    title:'未知',
    type:'UNKNOWN'
  },
  'PAGE_CREATOR':{
    icon:<WebIcon/>,
    title:'页面创建',
    type:'PAGE_CREATOR'
  },
  'DASHBOARD_CREATOR':{
    icon:<AddchartIcon/>,
    title:'仪表盘创建',
    type:'DASHBOARD_CREATOR'
  }
}

export const LoadingRender: FunctionComponent<IChatRenderProps> = props => {
  const { card } = props
  return (
    <div>
      <div>思考中...</div>
      {card.customContent.map(c=>{
        const config=SubAgentLoadingConfigs[c.type];
        return <div>
        <div className='flex'>{config.icon} <div>{config.title}</div></div>
        <LinearProgress />
      </div>
      })}
    </div>
  )
}
