'use client'

import { FieldType, ITable, bitable } from '@lark-base-open/js-sdk'

export class BaseAISDK {
  static async getCurListData() {
    const table = await bitable.base.getActiveTable()
    const recIds = await table.getRecordIdList()
    const fieldList = await table.getFieldList()
    const recordValue = await Promise.all(
      recIds.map(recId => {
        return BaseAISDK.getRecCellStr(recId, table)
      })
    )
    const metaList = await table.getFieldMetaList()
    return {
      header: metaList.map(f => {
        return { name: f.name, type: FieldType[f.type] }
      }),
      rows: recordValue
    }
  }
  static async getCurDetailData() {
    const table = await bitable.base.getActiveTable()
    const selection = await bitable.base.getSelection()
    const metaList = await table.getFieldMetaList()

    const recId = selection.recordId
    if (!recId) return []
    const row = await BaseAISDK.getRecCellStr(recId, table)
    return {
      header: metaList.map(f => {
        return { name: f.name, type: FieldType[f.type] }
      }),
      row
    }
  }
  static async getRecCellStr(recId: string, table: ITable) {
    const fieldList = await table.getFieldList()
    return Promise.all(fieldList.map(f => f.getCellString(recId)))
  }
}
global.window.BaseAISDK=BaseAISDK;