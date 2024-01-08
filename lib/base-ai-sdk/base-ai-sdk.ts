// 'use client'

import {
  FieldType,
  IAttachmentField,
  IBaseFieldDescription,
  IFieldProperty,
  IMultiSelectField,
  INumberField,
  IOpenCellValue,
  IRecordValue,
  ISingleSelectField,
  ITable,
  ITableMeta,
  bitable,
} from '@lark-base-open/js-sdk'
import Base from 'antd/es/typography/Base'
import { Interface } from 'readline'
import * as workflowStruct from './workflowStruct'
import * as dashboardStruct from './dashboardStruct'
import { get } from 'lodash'
import { table } from 'console'
import { getDialogContentTextUtilityClass } from '@mui/material'
import { getRecordsData_page, getFieldsData_page } from '@/app/actions'


export class BaseAISDK {

  static async getEnv() {
    const currentUrl = window.location.href; // 获取完整的 URL
    if (currentUrl.includes('pageid')) {
      return 'plugin'
    }
    else return 'independent page'
  }
  //-----------pageCreator--------//

  static async getRecordsData(tableName: string) {
    //判断逻辑 server触发还是independent page触发
    const mode = this.getEnv()
    if (await mode == 'plugin')
      return this.getRecordsData_plugin(tableName)
    if (await mode == 'independent page')
      return getRecordsData_page(tableName)
  }

  static async getFieldsData(tableName: string) {
    //判断逻辑 server触发还是independent page触发
    const mode = this.getEnv()

    if (await mode == 'plugin')
      return this.getFieldsData_plugin(tableName)

    if (await mode == 'independent page')
      return getFieldsData_page(tableName)

  }




  static async getFieldsData_plugin(tableName: string){
    const table = await bitable.base.getTable(tableName)
    const fieldList = await table.getFieldMetaList()
    return fieldList
  }
  static async getRecordsData_plugin(tableName: string){
    const table = await bitable.base.getTable(tableName)
    const recIds = await table.getRecordIdList()
    const recordValue = await Promise.all(
      recIds.map(recId => {
        return BaseAISDK.getRecCellContent(recId, table)
      })
    )
    return recordValue
  }



  
  static async getFormData_plugin(tableName: string) {
    const table = await bitable.base.getTable(tableName)
    const fieldList = await table.getFieldMetaList()
    return fieldList
  }

  static async getTableData_plugin(tableName: string) {
    const table = await bitable.base.getTable(tableName)
    const recIds = await table.getRecordIdList()
    const recordValue = await Promise.all(
      recIds.map(recId => {
        return BaseAISDK.getRecCellContent(recId, table)
      })
    )
    const fieldList = await table.getFieldMetaList()
    console.log('ccccccccclient',fieldList)
    return {
      header: fieldList.map(f => {
        return { name: f.name, type: FieldType[f.type] }
      }),
      rows: recordValue
    }
  }

  static async getDetailData_plugin(tableName: string) {
    const table = await bitable.base.getTable(tableName)
    const recordIdList = await table.getRecordIdList()
    let detailData = []
    for (const recordId of recordIdList) {
      const recordData = (await table.getRecordById(recordId)).fields
      let cells = []

      for (let fieldId in recordData) {
        const fieldName = await (await table.getField(fieldId)).getName()
        const value = recordData[fieldId]
        const cell = { fieldName, value }
        cells.push(cell)
      }
      detailData.push(cells)
    }
    return detailData
  }

  //-----------sysAgent-----------//


  static async getCurListData() {
    const table = await bitable.base.getActiveTable()
    const recIds = await table.getRecordIdList()
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
            try {
              //注意此处没有附件时会报错 
              return await attachmentField.getAttachments(recId)
            } catch (e) {
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
  static async getMetaList() {
    const tableMetaList = await bitable.base.getTableMetaList();

    // 使用 map 函数结合 async/await 来处理每个表
    const combinedMetaLists = await Promise.all(tableMetaList.map(async (tableMeta) => {
      // 使用表的 id 来获取表
      const table = await bitable.base.getTableById(tableMeta.id);
      // 获取该表的字段元数据
      const fieldMetaList = await table.getFieldMetaList();

      // 结合表的元信息和字段元信息
      return {
        tableMeta,        // 表的元信息
        fieldMetaList     // 字段元信息
      };
    }));
    return combinedMetaLists;
  }

  static async getTable() {
    const table = await bitable.base.getActiveTable();
    return table
  }

  static async getTableMetaList(): Promise<{
    id: string;
    name: string;
    isSync: boolean;
  }[]> {
    const tableMetaList = await bitable.base.getTableMetaList();
    return tableMetaList
  }

  static async getFieldMetaList(tableName: string): Promise<{
    id: string;
    type: FieldType;
    property: IFieldProperty;
    name: string;
    isPrimary: boolean;
    description: IBaseFieldDescription;
  }[]> {
    const table = await bitable.base.getTable(tableName);
    const fieldMetaList = await table.getFieldMetaList();
    return fieldMetaList
  }

  static async addTable(name: string) {
    const { tableId, index } = await bitable.base.addTable(
      {
        name: name,
        fields: []
      }
    )
    return tableId
  }

  static async addField(tableid: string, name: string, type: string) {
    const table = await bitable.base.getTableById(tableid)
    let curtype: FieldType;
    switch (type) {
      case "文本":
        curtype = FieldType.Text;
        break;
      case "数字":
        curtype = FieldType.Number;
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
    const field = await table.addField({ name: name, type: curtype });
    const returnField = await table.getFieldById(field);
    return field
  }
  //------------dashboardAgent-------------//
  static async addDashboard(dashBoardName: string) {
    const dashboardToken = bitable.bridge.addDashboard(dashBoardName);
    return dashboardToken;
  }

  static async getFieldByName(tableId: string, fieldName: string) {
    try {
      console.log("————————开始获取字段id————————");
      const table = await bitable.base.getTableById(tableId);
      const field = await table.getField(fieldName);
      const fieldType = field.getType(); // 如果 getType 是一个方法
      console.log("————————获取到的字段为：", field);
      return { fieldId: field.id, fieldType: fieldType };
    } catch (error) {
      console.error("Error in getFieldByName: ", error);
      throw error; // 或者处理错误
    }
  }

  static async getTableIdByName(tableName: string) {
    return bitable.base.getTableIdByName(tableName);
  }


  static async addChart(dashBoardToken: string, chartName: string, type: dashboardStruct.DetailChart, commonDataCondition: dashboardStruct.ICommonDataCondition) {
    let data: dashboardStruct.ICreateChartData = {
      name: chartName,
      chartKind: type,
      commonDataCondition: commonDataCondition
    };
    let dataArray: dashboardStruct.ICreateChartData[] = [data];
    console.log("!!!!!!!!!!!!!!!!", dataArray)
    const chart = bitable.bridge.addCharts(dashBoardToken, dataArray);
    return chart;
  }
  //------------workflowAgent-------------//

  static async generateJson(flow: StepData[], title: string) {
    // let jsonFile: string[] = [];
    // for (let step of flow) {
    //   jsonFile.push(JSON.stringify(step));
    // }

    return JSON.stringify(
      {
        steps: flow,
        title: title //工作流的名称
      });
  }

  static async generateValueByType(tableId: string, content: string[], fieldtype: FieldType, fieldId: string | 'noneed') {
    switch (fieldtype) {
      case FieldType.Text: {
        let value = {
          type: workflowStruct.SegmentType.TEXT,
          text: content[0]
        }
        console.log("11111111111111111value:::", value)
        return [value];
      }

      case FieldType.Number: {
        return Number(content[0]);
      }

      case FieldType.SingleSelect: {
        const table = await bitable.base.getTable(tableId)
        const field = await table.getField<ISingleSelectField>(fieldId)
        const options = await field.getOptions()
        const foundOption = options.find(element => element.name === content[0]);
        console.log("11111111111111111value:::", foundOption?.id)
        return foundOption?.id
      }

      case FieldType.MultiSelect: {
        const table = await bitable.base.getTable(tableId)
        const field = await table.getField<ISingleSelectField>(fieldId)
        const options = await field.getOptions()
        const ids = content.map(nameToFind => {
          const foundObject = options.find(element => element.name === nameToFind);
          return foundObject ? foundObject.id : null;
        })
        console.log("11111111111111111value:::", ids)
        return ids
      }

      case FieldType.DateTime: {
        console.log("11111111111111111value:::", content[0])
        return Number(content[0]);
      }

      default:
        throw new Error("Unsupported field type");
    }
  }


  static async generateAddRecordActionData(tableId: string, fieldIds: string[], content: string[][]) {
    // 检查 fieldIds 和 content 长度是否相等
    if (fieldIds.length !== content.length) {
      throw new Error("fieldIds and content arrays must be of the same length");
    }
    const valuesPromise = fieldIds.map(async (fieldId, index) => {
      const table = await bitable.base.getTable(tableId)
      const fieldType = await (await table.getFieldById(fieldId)).getType()
      const value = await this.generateValueByType(tableId, content[index], fieldType, fieldId)
      return {
        fieldId: fieldId,
        fieldType: fieldType,
        value: value,
        valueType: 'value'
      };
    });
    const values = await Promise.all(valuesPromise)
    console.log("22222222222222222values:::", values)
    return {
      tableId: tableId,
      values: values
    }
  }

}



interface IFieldMeta {
  id: string;
  type: FieldType;
  property: IFieldProperty;
  name: string;
  isPrimary: boolean;
  description: IBaseFieldDescription;
}




interface StepData {
  // 步骤id,当前流程内唯一
  id: string;
  // 下面的Trigger、Action
  data: TriggerData | ActionData;
  // 标识当前step 类型
  type: workflowStruct.TriggerType | workflowStruct.ActionType;
  // 当前步骤的下一步指向。最后一步该数据为[]
  next: [{
    // 指向下一步的stepId,只有一个元素
    ids: [string];
    // 当且仅当Trigger添加了Condtion条件配置才有，Action节点不存在
    // condition?: {
    //   conjunction: "and" | "or";
    //   conditions: ConditionInfo
    // }
  }] | [];
}
// -----------------------------trigger data------------------------------------
interface TriggerData { }
interface AddRecordTriggerV2Data extends TriggerData {
  // 选择的数据表tableId
  tableId: string;
  // 关注的字段fieldId (存量历史流程没有)
  watchedFieldId?: string;
}
// 设置的筛选条件
interface ConditionInfo { }
interface IFilterInfo extends ConditionInfo {
  // 条件之间的关系 “且” or “或”
  conjunction: "and" | "or";
  conditions: {
    // 配置项id 
    conditionId: string;
    // 字段id
    fieldId: string;
    // 字段类型
    fieldType: FieldType;
    operator: workflowStruct.FOperator;
    value: any;
  }[];
}
interface SetRecordData extends TriggerData {
  // 选择的数据表tableId
  tableId: string;
  // 选择记录（All 为全部记录，Filter 为指定记录）
  recordType: "All" | "Filter";
  // 设置的筛选条件，recordType="All"时为null
  filterInfo: IFilterInfo | null;
  // 关注的字段变更
  fields: {
    // 字段id
    fieldId: string;
    // 字段类型
    fieldType: FieldType;
    // 当设置触发值后，才有下面两个属性
    operator?: workflowStruct.FOperator;
    value?: IFilterFieldValue;
  }[];
}
interface ChangeRecordData extends TriggerData {
  // 选择的数据表tableId
  tableId: string;
  // 关注的字段变更
  fields: {
    // 字段id
    fieldId: string;
    // 字段类型
    fieldType: FieldType;
    operator?: workflowStruct.FOperator;
    value?: IFilterFieldValue;
  }[];
}
interface ReminderTriggerData extends TriggerData {
  // 选择的数据表tableId
  tableId: string;
  // 选择的日期字段Id
  fieldId: string;
  // 设置触发时间 （提前/退后）
  offset: number;
  // 时间单位
  unit: ReminderTriggerUnit;
  // 设置的具体时间
  //(日期字段没有设置时间（即timeFormat=false），则toSchema才会用到hour和minute，且值为非固定)
  hour: number;
  minute: number;
}
interface TimerTriggerData extends TriggerData {
  // 触发时间，单位毫秒
  startTime: number;
  // 规则
  rule: workflowStruct.TimeRule;
  // 间隔
  interval?: number;
  // 间隔单位
  unit?: workflowStruct.TimeUnit;
  // 子间隔单位
  subUnit?: number[];
  // 结束时间，单位毫秒 (非必需，rule='NO_REPEAT', 或者自定义重复设置截至日期)
  endTime?: number;
}
interface ButtonTriggerData extends TriggerData {
  // 选择的数据表tableId
  tableId: string;
  // 选择的按钮字段Id
  fieldId: string;
}


// -----------------------------action data-----------------------------------------
interface ActionData { }
interface addRecordAction extends ActionData {
  // // 添加记录的数据表tableId
  // tableId: string;
  // // 记录内容
  // values: {
  //   fieldId: string;
  //   fieldType: FieldType;
  //   value: any,
  //   // 当value 中存在引用值时为ref，否则为value
  //   valueType: "ref" | "value"
  // }[];
}// 通过调用generateAddRecordActionData生成
interface RefRecordInfo {
  // 步骤的id
  stepId: string;
}
interface FilterRecordInfo {
}
interface setRecordAction extends ActionData {
  //修改记录的数据表tableId
  tableId: string;
  // 所有记录（All）, 指定记录（Filter）, 第**步的记录（Ref）
  recordType: "All" | "Ref" | "Filter";
  // recordType=All 时，没有recordInfo字段； 
  //recordType=Ref, recordInfo值结构为RefRecordInfo；
  //recordType=Ref, recordInfo值结构为FilterRecordInfo
  recordInfo?: RefRecordInfo | FilterRecordInfo;
  // 记录内容
  values: {
    fieldId: string;
    fieldType: FieldType;
    value: any,
    // 当value 中存在引用值时为ref，否则为value
    valueType: "ref" | "value"
  }[];
}
interface findRecordAction extends ActionData {
  // 查找记录的数据表tableId
  tableId: string;
  // 查找的字段（字段Id）
  fieldIds: string[];
  // 字段id 和类型映射
  fieldsMap: {
    [fieldId: string]: {
      type: FieldType;
    };
  };
  // 选择记录：指定记录（Filter）, 第**步的记录（Ref）
  recordType: "Ref" | "Filter";
  recordInfo: RefRecordInfo | FilterRecordInfo;
  // 未查找到记录时是否继续执行 （默认为true）
  shouldProceedWithNoResults: boolean;
}
interface DelayActionData extends ActionData {
  // 延迟时间
  duration: number;
  // 延迟时间单位 (目前只有minute)
  unit: "second" | "minute" | "hour";
}
interface LarkMessageData extends ActionData {
  notifyIdentity: "mixed",
  // 由谁发送 （下面枚举值分别代表多维表格助手、自定义机器人、流程创建者）
  robotType: "bitable" | "customize" | "maker";
  person: [
    {
      "type": "ref",
      "avatarUrl": "https://s1-imfile.feishucdn.com/static-resource/v1/v2_8308cedd-c46c-4d08-9b87-ec93e9f3524g~?image_size=72x72&cut_type=default-face&quality=&format=jpeg&sticker_format=.webp",
      "id": "7104081156387209218",
      "value": "袁章",
      "tagType": "user",
      "owner_type": 0,
      "department": "Lark Base Engineering-Autopilot"
    },
    {
      "type": "ref",
      "avatarUrl": "https://s1-imfile.feishucdn.com/static-resource/v1/d7b21728-76c8-454d-b612-471ad1e9280g~?image_size=72x72&cut_type=default-face&quality=&format=jpeg&sticker_format=.webp",
      "id": "6953431841051262977",
      "value": "邓范鑫",
      "tagType": "user",
      "owner_type": 0,
      "department": "Lark Base Engineering-Autopilot"
    }
  ],
  groups: [
    {
      "type": "ref",
      "avatarUrl": "https://s1-imfile.feishucdn.com/static-resource/v1/v2_8308cedd-c46c-4d08-9b87-ec93e9f3524g~?image_size=72x72&cut_type=default-face&quality=&format=jpeg&sticker_format=.webp",
      "id": "7104081156387209218",
      "value": "袁章",
      "tagType": "user",
      "owner_type": 0,
      "department": "Lark Base Engineering-Autopilot"
    },
    {
      "type": "ref",
      "avatarUrl": "https://s1-imfile.feishucdn.com/static-resource/v1/d7b21728-76c8-454d-b612-471ad1e9280g~?image_size=72x72&cut_type=default-face&quality=&format=jpeg&sticker_format=.webp",
      "id": "6953431841051262977",
      "value": "邓范鑫",
      "tagType": "user",
      "owner_type": 0,
      "department": "Lark Base Engineering-Autopilot"
    }
  ],
  title: [
    TextSegment
  ],
  titleTemplateColor: workflowStruct.LarkHeaderTemplateColor,
  content: [
    TextSegment
  ],
  btnList: [
    {
      "btnKey": "message_btn_CJ6lMOSF",
      "btnAction": "openLink",
      "btnStyle": "primary",
      "text": "查看记录详情",
      "link": [
        {
          "id": "trigQn3FdKJs-tblyFuLY91TH6WNo-recordUrl10",
          "tagType": "stepLink",
          "stepId": "trigQn3FdKJs",
          "stepType": "AddRecordTrigger",
          "tableId": "tblyFuLY91TH6WNo",
          "isShortcut": true,
          "fieldId": "",
          "viewId": "",
          "value": "",
          "stepNum": 1,
          "type": "ref"
        }
      ]
    }
  ],
  needBtn: false,
  needTopBase: true
}
// ------------------------------condition-------------------------------------------
// Field相关的Triggger对应的Condition结构
interface FieldCondtionInfo extends ConditionInfo {
  conjunction: workflowStruct.FilterConjunction;
  conditions: {
    conjunction: workflowStruct.FilterConjunction;
    conditions: {
      conditionId: string
      fieldId: string;
      fieldType: FieldType;
      operator: workflowStruct.FOperator;
      value: any
    }[]
  }[];
}
// 定时触发Trigger对应的Condition结构
interface TimeConditionInfo extends ConditionInfo {
  operator: workflowStruct.FOperator;
  value:
  // FilterDuration 定义的枚举值（除过ExactDate），
  [Exclude<workflowStruct.FilterDuration, workflowStruct.FilterDuration.ExactDate>]
  // 表示具体日期，数组第一个值固定为“ExactDate”
  | [workflowStruct.FilterDuration.ExactDate, workflowStruct.DateTimeDomainFieldValue]
  | null;
}
// -------------------------------------segment-----------------------------------
export interface Segment {
  // segment类型标识
  type: workflowStruct.SegmentType;
  // 校验segment是否合法，errorType有值，则编译抛错
  //errorType?: workflowStruct.ErrorType;
};
export interface TextSegment extends Segment {
  type: workflowStruct.SegmentType.TEXT;
  text: string;
}
export interface OptionSegment extends Segment {
  type: workflowStruct.SegmentType.OPTION;
  value: string;
  label?: string;
}
export enum FormValueType {
  TEXT = 'text',
}
export type KeyValueItem = { key: string | Segment[]; value: Segment[]; type?: FormValueType };

export interface ParamSegment extends Segment {
  type: workflowStruct.SegmentType.PARAM;
  value: KeyValueItem[];
}
export interface DateSegment extends Segment {
  // type: workflowStruct.SegmentType.DATE;
  value: number; // 日期，ms，unix 时间戳，精度为天
}
export interface TimeSegment extends Segment {
  type: workflowStruct.SegmentType.TIME;
  value: number; // 小时:分钟，ms，0-86400000
}

global.window.BaseAISDK = BaseAISDK
global.window.bitable = bitable
