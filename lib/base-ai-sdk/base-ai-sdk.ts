'use client'

import {
  FieldType,
  IAttachmentField,
  IMultiSelectField,
  INumberField,
  ITable,
  bitable
} from '@lark-base-open/js-sdk'

export class BaseAISDK {
  static async getCurListData() {
    const table = await bitable.base.getActiveTable()
    const recIds = await table.getRecordIdList()
    const fieldList = await table.getFieldList()
    const recordValue = await Promise.all(
      recIds.map(recId => {
        return BaseAISDK.getRecCellContent(recId, table)
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
  static async getRecCellContent(recId: string, table: ITable) {
    const fieldList = await table.getFieldList()
    return Promise.all(
      fieldList?.map(async f => {
        const type = await f.getType()
        //对附件 ，多选， 数字的值进行特化
        switch (type) {
          case FieldType.Attachment:
            const attachmentField = await table.getField<IAttachmentField>(f.id);
            try{
              //注意此处没有附件时会报错 
              return await attachmentField.getAttachmentUrls(recId)
            }catch(e){
              return ""
            }
          case FieldType.Number:
            return await (f as INumberField).getValue(recId)
          case FieldType.MultiSelect:
            return await (f as IMultiSelectField).getValue(recId)
          default:
            return await f.getCellString(recId)
        }
      })
    )
  }
}
// global.window.BaseAISDK = BaseAISDK
