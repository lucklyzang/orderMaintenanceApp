import request from '@/utils/request'
// 获取所有任务列表
export function getAllTaskList(data) {
	return request({
	    url: 'nblink/patrol/checkTask/app/all',
	    method: 'get',
        params: data
	})
}

// 获取任务详情
export function getTaskDetails(taskId) {
	return request({
	    url: `nblink/patrol/checkTask/app/one/${taskId}`,
	    method: 'get'
	})
}

// 扫描科室二维码
export function departmentScanCode(data) {
	return request({
	    url: 'nblink/patrol/checkTask/app/scan',
	    method: 'put',
        data
	})
}

// 已完成任务点击科室扫描二维码
export function departmentScanCodeFinsh(data) {
	return request({
	    url: 'nblink/patrol/checkTask/app/for/finish',
	    method: 'get',
        params: data
	})
}

// 检查项通过
export function checkItemPass(data) {
	return request({
	    url: 'nblink/patrol/checkResult/check/OK',
	    method: 'put',
        data
	})
}

// 检查项通过
export function checkItemNoPass(data) {
	return request({
	    url: 'nblink/patrol/checkResult/check/NO',
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
