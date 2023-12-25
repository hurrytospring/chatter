
export enum DetailChart {
    unknown = 0,
    /**
     * 基于xy坐标系的图表类型
     */
    xy = 1048576,
    /**
     * xy下的线型图表类型
     * 以及其具体的线型子类型（直线、曲线、阶梯）；
     */
    linear = 1060864,
    smooth = 1069056,
    stepped = 1085440,
    /**
     * xy下会交换坐标轴的图表类型（比如条形图）
     */
    swapAxes = 1114112,
    //柱状
    column = 1048833,
    bar = 1114370,
    line = 1052932,
    area = 1052936,
    //散点图
    scatter = 1048592,
    //组合
    combo = 1052960,
    /**
     * 组合图的子类型
     */
    dualAxes = 1053024,
    /** 极坐标 */
    radial = 1179648,
    /** 雷达图 */
    radar = 1441792,
    /** 普通折线雷达图 */
    lineRadar = 1441793,
    /** 带数据标记的雷达图 */
    linePointRadar = 1441794,
    /** 填充雷达图 */
    areaRadar = 1441796,
    /**
     * 饼图的类型
     */
    pie = 2097152,
    normalPie = 2097408,

    /**
     * 漏斗图
     */
    funnel = 16777216,
    normalFunnel = 16777472,
    bilateralFunnel = 16777728,
    /**
     * 瀑布图
     */
    waterfall = 1572864,
    /**
     * 排列图
     */
    pareto = 33554432,
    /**
     * 气泡图 1 << 26
     */
    bubble = 67108864
}

export enum Rollup {
    SUM = 'SUM',
    AVERAGE = 'AVERAGE',
    COUNTA = 'COUNTA',
    MAX = 'MAX',
    MIN = 'MIN',
}

export interface ICommonDataCondition {
    tableId: string;

    /**
     * 分组依据
     *
     * 指定二维表的首列、首行结构
     * 指定 group[0] 的列 id，会作为二维表的首列
     * 指定 group[1] 的列 id，会作为二维表的首行
     *
     * 目前这个能力用于 Chart 和 Stat. 注意：指定两个分组时，只能有一个 SeriesArray
     */
    // 字段为多选时，拆分统计 ，GroupMode='enumerated'
    group: string[];

    /**
     * 指定要作为二维表的列
     * 可以指定 seriesArray[n].fieldId 作为每一个列的内容，并且可以指定统计方式
     * Max, min, average, sum, counta 等 (原值待支持)
     *
     * "COUNTA" 是一个特殊需求，业务可以要求第三方数据源返回满足筛选条件的【个数】
     * 或者说每个【分组】里面的个数
     */
    seriesArray: Series[] | 'COUNTA';



}

export interface Series {
    fieldId: string;
    rollup: Rollup;
}

export interface ICreateChartData {
    name: string,
    chartKind: DetailChart,
    // 优先关注 tableId，group，seriesArray 三个字段
    commonDataCondition: ICommonDataCondition
}

//其他配置，
//  export enum GroupMode {
//   ENUMERATED = 'enumerated', // 拆分统计，“A,B,C” -> A | B | C
//   INTEGRATED = 'integrated', // 不拆分统计，“A,B,C” -> “A,B,C”
// }
// export interface ISort {
//   order?: ORDER_ENUM;
//   sortType: DATA_SOURCE_SORT_TYPE;
// }
// interface ISnapshot{
//     overrideViewModel: {
//     // 默认，横轴将数字视为文本
//     cartesian: {  combo: { detail: {} }, indexAxes: { axes: [{ type: 'ordinal' }] } }
//     }
//  }