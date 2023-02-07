import request from '@/utils/request'
// 用户退出登录
export function userSignOut() {
    return request({
      url: 'nblink/auth/logout',
      method: 'post'
    })
};

// 账号密码登录
export function logIn(data) {
	return request({
	    url: 'nblink/auth/login',
	    method: 'post',
	    data
	})
}


// 查询医院信息
export function getHospitalMessage(proId) {
	return request({
	    url: `nblink/hospital/hospitalAreaQueryById/${proId}`,
	    method: 'get'
	})
}

// 获取阿里云签名接口
export function getAliyunSign() {
	return request({
	    url: 'nblink/patrol/oss/getSign',
	    method: 'get'
	})
}