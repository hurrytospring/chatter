'use client'

<<<<<<< HEAD
import {FieldType, IRecordValue, ITable, bitable} from '@lark-base-open/js-sdk'
=======
import { FieldType, ITable, bitable } from '@lark-base-open/js-sdk'
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5

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
<<<<<<< HEAD
  static async getTable(){
    const table = await bitable.base.getActiveTable();
    return table
  }

  static async getFieldMetaList(){
    const table = await this.getTable();
    const fieldMetaList = await table.getFieldMetaList();
    return fieldMetaList
  }
  
  static async addTable(name:string){
    const { tableId, index } = await bitable.base.addTable(
      {
        name: name,
        fields: []
      }
      )
    return tableId
  }

  static async addField(tableid:string,name:string,type:string){
    const table = await bitable.base.getTableById(tableid)
    let curtype : FieldType;
    switch (type) {
      case "文本":
          curtype = FieldType.Text;
          break;
      case "单选":
          curtype = FieldType.SingleSelect;
          break;
      case "多选":
          curtype = FieldType.MultiSelect;
          break;
      case "链接":
          curtype = FieldType.Url;
          break;
      case "时间":
          curtype = FieldType.DateTime;
          break;
      case "创建时间":
          curtype = FieldType.CreatedTime;
          break;
      case "更新时间":
          curtype = FieldType.ModifiedTime;
          break;
      // ... 持续为其他类型添加case语句
      case "评分":
          curtype = FieldType.Rating;
          break;
      case "进度":
          curtype = FieldType.Progress;
          break;
      case "邮箱":
          curtype = FieldType.Email;
      case "附件":
          curtype = FieldType.Attachment;
          break;
      default:
          throw new Error("不支持的字段类型");
  }
    const field = await table.addField({ name:name, type:curtype});
    const returnField = await table.getFieldById(field);
    return field
  }

  static async getRecords(tableid:string,pageSize:number){
    if(pageSize>5000)
      return "数量最大不得超过5000！！"
    const table = await bitable.base.getTableById(tableid);
    const records = await table.getRecords({pageSize: pageSize});
    return records
  }


  static async addRecord(tableid:string,Fields:string[], values:string[]){
    const table = await bitable.base.getTableById(tableid);
    const textField = await table.getField(Fields[0]);
    const textCell = await textField.createCell(values[0]);
    const recordId = await table.addRecord(textCell);
    if(Fields.length>1){
      for(let i=1; i<Fields.length; i++){
        const field = await table.getField(Fields[i]);
        const res = await table.setRecord(recordId,{
          fields:{
            [field.id]:values[i]
          }
        })
      }
    }
    return recordId;
  }

  static async editCurRecords(order: number, fieldId: string, recordValues?: string[], recordNums?: number[]){
    // order: 1.增 2.删 3.改
    const table = await bitable.base.getActiveTable()


    if (order == 1 && recordValues && recordValues.length > 0){
      const textField = await table.getField(fieldId); // 选择某个多行文本字段
      
      const recordIds: string[] = [];
      for (const value of recordValues) {
        const textCell = await textField.createCell(value);
        const recordId = await table.addRecords([[textCell]]);
        recordIds.push(recordId[0]);
      }
      return {
        header: recordIds.map(f => {
          return { name: f, type: textField.getType }
        }),
        row: "记录新增成功！"
      }
    }

    //单次删除记录上限 5000 条
    if(order==2 && recordNums && recordNums.length>0){
      const recordIdList = await table.getRecordIdList();
      for (const num of recordNums) {
        await table.deleteRecord(recordIdList[num]);
      }
      return {
        header: 
          { name: "None", type: "None"}
        ,
        row: "记录删除成功！"
      }
    }

    //
    if(order==3 && recordNums && recordNums.length>0 && recordValues && recordValues.length > 0){
      if(recordNums.length==recordValues.length){  
        const recordIds = await table.getRecordIdList(); // 获取所有记录 id
        const field = await table.getField(fieldId); // 选择多行文本字段   
        for(let i=0; i<recordNums.length; i++) {
          await table.setRecord(
            recordIds[i],
            {fields: 
              {
                [field.id]: recordValues[i]
              }
            }
          )
        }
        return {
          header: recordIds.map(f => {
            return { name: f, type: field.getType }
          }),
          row: "记录修改成功！"
        }
    }
      else
        return "记录数与记录值总数不一致！"



    }
  }
=======
>>>>>>> 59f0f6e742a2804164ad438ded421428e07454f5
}
global.window.BaseAISDK=BaseAISDK;