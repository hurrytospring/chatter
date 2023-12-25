// Trigger 类型枚举定义 （用于前端组件渲染）
export enum TriggerType {
    AddRecord = 'AddRecordTrigger',
    SetRecord = 'SetRecordTrigger',
    ChangeRecord = 'ChangeRecordTrigger',
    Timer = 'TimerTrigger',
    Reminder = 'ReminderTrigger',
    Button = 'ButtonTrigger',
}

// trigger类型枚举定义（用于前端组件渲染）
export enum ActionType {
    Delay = 'Delay',
    LarkMessage = 'LarkMessageAction',
    AddRecord = 'AddRecordAction',
    SetRecord = 'SetRecordAction',
    FindRecord = 'FindRecordAction',
    HTTPClient = 'HTTPClientAction',
    // 二方Action
    APIHub = 'APIHubAction',
    RefreshAIField = 'RefreshAIFieldAction',
    // 三方Action
    Extension = 'ExtensionAction',
}

export enum FOperator {
    Is = 'is',
    IsNot = 'isNot',
    Contains = 'contains',
    ContainText = 'containText',
    DoesNotContain = 'doesNotContain',
    IsEmpty = 'isEmpty',
    IsNotEmpty = 'isNotEmpty',
    IsGreater = 'isGreater',
    IsGreaterEqual = 'isGreaterEqual',
    IsLess = 'isLess',
    IsLessEqual = 'isLessEqual',
}

export enum ReminderTriggerUnit {
    minute = 1,
    hour = 2,
    day = 3,
    week = 4,
    month = 5
}

export type DateTimeDomainFieldValue = number | null;

export enum TimeRule {
    NO_REPEAT = 'NO_REPEAT',
    HOURLY = 'HOURLY',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
    CUSTOM = 'CUSTOM',
    WORKDAY = 'WORKDAY',
}

export enum TimeUnit {
    HOUR = 'HOUR',
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
}

//飞书消息标题背景色枚举值
export enum LarkHeaderTemplateColor {
    NONE = 'none', // 表示无主题颜色
    BLUE = 'blue',
    WATHET = 'wathet',
    TURQUOISE = 'turquoise',
    GREEN = 'green',
    YELLOW = 'yellow',
    ORANGE = 'orange',
    RED = 'red',
    CARMINE = 'carmine',
    VIOLET = 'violet',
    PURPLE = 'purple',
    INDIGO = 'indigo',
    GREY = 'grey',
}

export enum FilterConjunction {
    And = 'and',
    Or = 'or',
}

export enum FilterDuration {
    ExactDate = 'ExactDate',
    Today = 'Today',
    Tomorrow = 'Tomorrow',
    Yesterday = 'Yesterday',
    TheLastWeek = 'TheLastWeek', // 过去7天
    TheNextWeek = 'TheNextWeek', // 未来7天
    TheLastMonth = 'TheLastMonth', // 过去30天
    TheNextMonth = 'TheNextMonth', // 未来30天
    CurrentWeek = 'CurrentWeek',
    LastWeek = 'LastWeek',
    CurrentMonth = 'CurrentMonth',
    LastMonth = 'LastMonth',
}

export enum SegmentType {
    REF = 'ref', // 兼容旧数据，勿动
    TEXT = 'text',
    DATE = 'date',
    TIME = 'time',
    LINK = 'link',
    OPTION = 'option',
    PARAM = 'param',
};