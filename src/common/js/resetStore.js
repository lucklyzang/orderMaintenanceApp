// 登录信息store的初始值
export function getDefaultLoginState() {
    return {
        userInfo: null, //用户信息
        permissionInfo: [], //权限列表
        roleNameList: [], //角色列表
        isLogin: false, //是否登录
        token: null, //请求token
        overDueWay: false, // 过期方式
        timeMessage: {}, //阿里云签名过期时间信息
        ossMessage: {}, //阿里云签名信息
        chooseProject: [], //选择的医院 
        hospitalMessage: {} //医院信息
    }
};

// 巡更模块store的初始值
export function getDefaultPatrolTaskState() {
    return {
        taskType: {}, //任务类型
        taskOrderType: {}, //任务工单类型
        departmentCheckList: {
            depId: '',
            checkItemList: []
        }, // 科室检查项信息
        enterProblemRecordMessage: {}, //进入问题记录页时携带的相关信息
        patrolTaskListMessage: {}, //巡查任务列表信息
        currentElectronicSignature: null, // 工单完成时的签名信息
        originalSignature: null //// 工单完成时原始签名信息
    }
};

// 事件登记模块store的初始值
export function getDefaultEventRegisterState() {
    return {
        temporaryStorageRepairsRegisterMessage: {}, // 报修登记信息
        eventRegisterType: '' // 事件登记类型
    }
};