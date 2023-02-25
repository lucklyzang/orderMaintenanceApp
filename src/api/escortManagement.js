import request from '@/utils/request'

// 巡更任务

// 获取巡更任务列表
export function getAllTaskList(data) {
    return request({
        url: 'nblink/patrol/checkTask/app/page',
        method: 'get',
        params: data
    })
}

// 获取任务详情
export function getTaskDetails(taskId) {
    return request({
        url: `nblink/patrol/checkTask/app/detail/one/${taskId}`,
        method: 'get'
    })
}

// 打卡科室(包括蓝牙和手动打卡)
export function clockingsSection(data) {
    return request({
        url: 'nblink/patrol/checkTask/app/punch',
        method: 'put',
        data
    })
}

// 已完成打卡的科室点击
export function departmentClockFinsh(data) {
    return request({
        url: 'nblink/patrol/checkTask/app/hasSpace/itemsDetail',
        method: 'get',
        params: data
    })
}

// 检查项通过
export function checkItemPass(data) {
    return request({
        url: 'nblink/patrol/checkResult/check/2Yes',
        method: 'put',
        data
    })
}

// 检查项不通过
export function checkItemNoPass(data) {
    return request({
        url: 'nblink/patrol/checkResult/check/2No',
        method: 'put',
        data
    })
}

// 提交检查项
export function submitCheckItem(data) {
    return request({
        url: 'nblink/patrol/checkResult/check/confirm',
        method: 'put',
        data
    })
}

// 上传问题工单
export function problemWorkOrderUpload(data) {
    return request({
        url: 'nblink/patrol/problemTask/problem',
        method: 'post',
        data
    })
}


// 本次任务问题工单
export function getCurrentTaskProblemWorkerOrder(taskId) {
    return request({
        url: `nblink/patrol/problemTask/app/current/${taskId}`,
        method: 'get'
    })
}

// 所有任务问题工单
export function getAllTaskProblemWorkerOrder(data) {
    return request({
        url: 'nblink/patrol/problemTask/app/all',
        method: 'get',
        params: data
    })
}

// 查询任务问题工单详情
export function getTaskProblemWorkerOrderDetails(data) {
    return request({
        url: 'nblink/patrol/problemTask/app/one',
        method: 'get',
        params: data
    })
}

// 任务完成
export function taskComplete(data) {
    return request({
        url: 'nblink/patrol/checkTask/app/confirm',
        method: 'put',
        data
    })
}

// 事件登记

// 获取事件列表
export function getEventList(data) {
    return request({
        url: 'nblink/patrol/eventregister/listForApp',
        method: 'get',
        params: data
    })
}

// 获取事件详情
export function getEventDetails(id) {
    return request({
        url: `nblink/patrol/eventregister/${id}`,
        method: 'get'
    })
}

// 登记事件
export function eventregister(data) {
    return request({
        url: 'nblink/patrol/eventregister/',
        method: 'post',
        data
    })
}

// 拾金不昧交接
export function eventHandover(data) {
    return request({
        url: 'nblink/patrol/eventregister/handover',
        method: 'put',
        data
    })
}

// 拾金不昧联系
export function eventContact(data) {
    return request({
        url: 'nblink/patrol/eventregister/contact',
        method: 'put',
        data
    })
}

// 拾金不昧领取
export function eventReceive(data) {
    return request({
        url: 'nblink/patrol/eventregister/receive',
        method: 'put',
        data
    })
}

// 事件删除
export function eventDelete(id) {
    return request({
        url: `nblink/patrol/eventregister/${id}`,
        method: 'delete'
    })
}

// 查询建筑信息
export function queryStructure(proId) {
    return request({
        url: `nblink/hospital/structures/${proId}`,
        method: 'get'
    })
};

// 查询科室信息
export function queryDepartment(data) {
    return request({
        url: 'nblink/hospital/departments',
        method: 'get',
        params: data
    })
};

// 查询空间信息
export function querySpace(data) {
    return request({
        url: 'nblink/hospital/spaces',
        method: 'get',
        params: data
    })
};

// 查询登记用户
export function queryRegisterUser(data) {
    return request({
        url: 'nblink/patrol/eventregister/queryRegisterUser',
        method: 'get',
        params: data
    })
};


// 留言簿

// 留言查询
export function queryGuestBook(data) {
    return request({
        url: 'nblink/patrol/guestBook/app/list',
        method: 'get',
        params: data
    })
};

// 留言删除
export function guestBookDelete(id) {
    return request({
        url: `nblink/patrol/guestBook/${id}`,
        method: 'delete'
    })
};

// 评论删除
export function guestCommentDelete(id) {
    return request({
        url: `nblink/patrol/guestComment/${id}`,
        method: 'delete'
    })
};

// 评论添加
export function guestCommentAdd(data) {
    return request({
        url: 'nblink/patrol/guestComment',
        method: 'post',
        data
    })
};

// 留言添加
export function guestBookAdd(data) {
    return request({
        url: 'nblink/patrol/guestBook',
        method: 'post',
        data
    })
};

// 点赞
export function guestSupport(data) {
    return request({
        url: 'nblink/patrol/guestSupport',
        method: 'get',
        params: data
    })
};

// 取消点赞
export function guestCancel(id) {
    return request({
        url: `nblink/patrol/guestSupport/${id}`,
        method: 'get'
    })
};