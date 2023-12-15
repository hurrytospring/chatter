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
//会报错， 暂时注释
//   static async addDashboard(){     
//     const blockService = await getDashboardBlockService(bitableStore);
//     const blockManager = blockService?.getBlockManager();

//     //todo:blockManager ！断言
//     const resp = await blockManager!.modelManager.createToken(params.type, getCirculationInfo(params.type), {});
//     const { token } = resp;
//     this.updateShowTempItem(false);

//     const ret = await operate.baseOperate.addBlock({
//       token,
//       type: BlockType.DASHBOARD,
//     });
//     return ret;
//   }
  
  
//   static async addChart(DashBoardId: string, chartName: string, type: DetailChart, commonDataCondition: ICommonDataCondition){
//     const table = await bitable.base.getTableById(commonDataCondition.tableId)
//     const dashBoard = await table.getDashBoardById(DashBoardId)
//     const chart = dashBoard.addchart(chartName,type,commonDataCondition)
//   }
// }
  
// export declare enum DetailChart {
//   unknown = 0,
//   /**
//    * 基于xy坐标系的图表类型
//    */
//   xy = 1048576,
//   /**
//    * xy的衍生类型：能够进行堆叠的图表类型、
//    * 以及其具体的堆叠子类型（不堆叠、堆叠非百分比、百分比堆叠）；
//    */
//   stackAble = 1048832,
//   noStack = 1049344,
//   stack = 1049856,
//   stackPercentage = 1050880,
//   /**
//    * xy下的线型图表类型
//    * 以及其具体的线型子类型（直线、曲线、阶梯）；
//    */
//   lineLike = 1052672,
//   linear = 1060864,
//   smooth = 1069056,
//   stepped = 1085440,
//   /**
//    * xy下会交换坐标轴的图表类型（比如条形图）
//    */
//   swapAxes = 1114112,
//   //柱状
//   column = 1048833,
//   bar = 1114370,
//   line = 1052932,
//   area = 1052936,
//   //散点图
//   scatter = 1048592,
//   //组合
//   combo = 1052960,
//   /**
//    * 组合图的子类型
//    */
//   dualAxes = 1053024,
//   /** 极坐标 */
//   radial = 1179648,
//   /** 雷达图 */
//   radar = 1441792,
//   /** 普通折线雷达图 */
//   lineRadar = 1441793,
//   /** 带数据标记的雷达图 */
//   linePointRadar = 1441794,
//   /** 填充雷达图 */
//   areaRadar = 1441796,
//   /**
//    * 饼图的类型
//    */
//   pie = 2097152,
//   normalPie = 2097408,
//   donut = 2097664,
//   statistics = 4194304,
//   wordCloud = 8388608,
//   /**
//    * 漏斗图
//    */
//   funnel = 16777216,
//   normalFunnel = 16777472,
//   bilateralFunnel = 16777728,
//   /**
//    * 瀑布图
//    */
//   waterfall = 1572864,
//   /**
//    * 排列图
//    */
//   pareto = 33554432,
//   /**
//    * 气泡图 1 << 26
//    */
//   bubble = 67108864
// }
  
// export interface Series {
//   fieldId: string;
//   rollup: Rollup;
// }

//  export enum GroupMode {
//   ENUMERATED = 'enumerated', // 拆分统计，“A,B,C” -> A | B | C
//   INTEGRATED = 'integrated', // 不拆分统计，“A,B,C” -> “A,B,C”
// }

// export enum Rollup {
//   SUM = 'SUM',
//   AVERAGE = 'AVERAGE',
//   COUNTA = 'COUNTA',
//   MAX = 'MAX',
//   MIN = 'MIN',
// }

// export interface ISort {
//   order?: ORDER_ENUM;
//   sortType: DATA_SOURCE_SORT_TYPE;
// }

// export interface ICommonDataCondition{
//   tableId: string;

//   /**
//    * 分组依据
//    *
//    * 指定二维表的首列、首行结构
//    * 指定 group[0] 的列 id，会作为二维表的首列
//    * 指定 group[1] 的列 id，会作为二维表的首行
//    *
//    * 目前这个能力用于 Chart 和 Stat. 注意：指定两个分组时，只能有一个 SeriesArray
//    */
//    // 字段为多选时，拆分统计 ，GroupMode='enumerated'
//   group: (string | IGroupItem)[];

//   /**
//    * 指定要作为二维表的列
//    * 可以指定 seriesArray[n].fieldId 作为每一个列的内容，并且可以指定统计方式
//    * Max, min, average, sum, counta 等 (原值待支持)
//    *
//    * "COUNTA" 是一个特殊需求，业务可以要求第三方数据源返回满足筛选条件的【个数】
//    * 或者说每个【分组】里面的个数
//    */
//   seriesArray: Series[] | 'COUNTA';
  
  
//   // ------ 配置默认值
//     /**
//    * 数据源筛选条件
//    * 按照约定，view 和 viewId 同时存在
//    * Custom 和自定义的 filterInfo 同时存在
//    */
//    //默认值  {SourceType:'ALL'}
//   source?: CommonDataConditionItemSource;
  
//     /**
//    * 值排序规则
//    *
//    * 按照二维数据表生成的数据进行排序， 可以选择正序还是逆序，暂时是为了图表按照y值排序提供的。
//    * 如果是多个系列，则按照第一个系列排，两值相等的话，进行下一个数据比较，以此类推
//    */
//    // 默认值 { order?: ORDER_ENUM.ASCENDING,sortType: DATA_SOURCE_SORT_TYPE.GROUP;}
//   dataSort?: ISort;
//  }
//  //其他配置，
//  interface ISnapshot{
//     overrideViewModel: {
//     // 默认，横轴将数字视为文本
//     cartesian: {  combo: { detail: {} }, indexAxes: { axes: [{ type: 'ordinal' }] } }
//     }
//  }
}
// // global.window.BaseAISDK = BaseAISDK
