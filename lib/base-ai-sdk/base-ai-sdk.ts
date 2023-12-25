'use client'

import {
  FieldType,
  IAttachmentField,
  IMultiSelectField,
  INumberField,
  ITable,
  bitable,
} from '@lark-base-open/js-sdk'
import Base from 'antd/es/typography/Base'
import { Interface } from 'readline'
import * as workflowStruct from './workflowStruct'
import * as dashboardStruct from './dashboardStruct'
export class BaseAISDK {
  //-----------sysAgent-----------//
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
  static async getTable() {
    const table = await bitable.base.getActiveTable();
    return table
  }

  static async getFieldMetaList() {
    const table = await this.getTable();
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

  static async getRecords(tableid: string, pageSize: number) {
    if (pageSize > 5000)
      return "数量最大不得超过5000！！"
    const table = await bitable.base.getTableById(tableid);
    const records = await table.getRecords({ pageSize: pageSize });
    return records
  }

  static async addRecord(tableid: string, Fields: string[], values: string[]) {
    const table = await bitable.base.getTableById(tableid);
    const textField = await table.getField(Fields[0]);
    const textCell = await textField.createCell(values[0]);
    const recordId = await table.addRecord(textCell);
    if (Fields.length > 1) {
      for (let i = 1; i < Fields.length; i++) {
        const field = await table.getField(Fields[i]);
        const res = await table.setRecord(recordId, {
          fields: {
            [field.id]: values[i]
          }
        })
      }
    }
    return recordId;
  }

  static async editCurRecords(order: number, fieldId: string, recordValues?: string[], recordNums?: number[]) {
    // order: 1.增 2.删 3.改
    const table = await bitable.base.getActiveTable()


    if (order == 1 && recordValues && recordValues.length > 0) {
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
    if (order == 2 && recordNums && recordNums.length > 0) {
      const recordIdList = await table.getRecordIdList();
      for (const num of recordNums) {
        await table.deleteRecord(recordIdList[num]);
      }
      return {
        header:
          { name: "None", type: "None" }
        ,
        row: "记录删除成功！"
      }
    }

    //
    if (order == 3 && recordNums && recordNums.length > 0 && recordValues && recordValues.length > 0) {
      if (recordNums.length == recordValues.length) {
        const recordIds = await table.getRecordIdList(); // 获取所有记录 id
        const field = await table.getField(fieldId); // 选择多行文本字段   
        for (let i = 0; i < recordNums.length; i++) {
          await table.setRecord(
            recordIds[i],
            {
              fields:
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

  static async generateJson(flow: StepData[]): Promise<string[]> {
    let jsonFile: string[] = [];
    for (let step of flow) {
      jsonFile.push(JSON.stringify(step));
    }
    return jsonFile;
  }
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
    // 指向下一步的stepId
    ids: [string];
    // 当且仅当Trigger添加了Condtion条件配置才有，Action节点不存在
    condition?: ConditionInfo;
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
interface ConditionInfo{}
interface IFilterInfo extends ConditionInfo{
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
    value: [];
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
  // 添加记录的数据表tableId
  tableId: string;
  // 记录内容
  values: {
    fieldId: string;
    fieldType: FieldType;
    value: any,
    // 当value 中存在引用值时为ref，否则为value
    valueType: "ref" | "value"
  }[];
}
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
interface sendMsgAction extends ActionData {    // 由谁发送 （下面枚举值分别代表多维表格助手、自定义机器人、流程创建者）
  robotType: "bitable" | "customize" | "maker";
  persons: [];
  groups: [];
  webhookList: [];
  // 消息标题背景色
  titleTemplateColor: workflowStruct.LarkHeaderTemplateColor;
  // 消息标题
  title: [];
  // 消息内容
  content: Segment[];
  // 控制配置中的底部按钮是否展示和按钮配置是否参与toschema 编译
  needBtn: boolean;
  //按钮配置
  btnList?: [
  ];
}
interface KeyValueItem {
  key: string;
  value: Segment[];
  type?: FormValueType;
}
interface httpClientAction extends ActionData {
  // 请求方法
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  // 请求Url
  url: Segment[];
  // 查询参数
  queries: KeyValueItem[];
  // 请求头
  headers: KeyValueItem[];
  // 请求体类型
  bodyType?: "none" | "raw" | "form-data" | "form-urlencoded";
  // bodyType=raw时，对应的请求体内容
  rawBody: any;
  // bodyType=form-data时，对应的请求体内容
  formBody: [];
  // 响应体
  responseType: "none" | "text" | "json";
  responseValue: any
}
interface DelayActionData extends ActionData {
  // 延迟时间
  duration: number;
  // 延迟时间单位 (目前只有minute)
  unit: "second" | "minute" | "hour";
}

// ------------------------------condition-------------------------------------------
// Field相关的Triggger对应的Condition结构
interface FieldCondtionInfo extends ConditionInfo{
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
  errorType?: workflowStruct.ErrorType;
};



global.window.BaseAISDK = BaseAISDK
global.window.bitable = bitable
