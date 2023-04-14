import axios from 'axios'
import store from '@/store'
import router from '../router'
import Vue from 'vue';
import qs from 'qs';
import { removeAllLocalStorage } from "@/common/js/utils";
import { Dialog, Toast } from 'vant';
// 全局注册 
Vue.use(Dialog);
// 开发环境： http://blink.blinktech.cn
// 测试环境：http://show.blinktech.cn
// 准生产环境：http://ver.blinktech.cn
// 生产环境：http://blinktech.cn
const service = axios.create({
    baseURL: 'http://blink.blinktech.cn', //接口基础地址
    retry: 2, // 网络请求异常后，重试次数
    retryDelay: 1000, // 每次重试间隔时间
    shouldRetry: (err) => true // 重试条件
});

// request interceptor
service.interceptors.request.use(
    config => {
        if (config.method === 'get') {
            config.paramsSerializer = function(params) {
                return qs.stringify(params, { arrayFormat: 'repeat' })
            }
        };
        config.headers['HTTP_REQUEST_TYPE'] = 'new';
        if (config['url'] == 'auth/login') {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        };
        // 请求头添加token
        if (store.getters.token) {
            config.headers['Authorization'] = store.getters.token
        };
        return config;
    },
    function(error) {
        //处理请求错误
        return Promise.reject(error.response);
    }
);

// response interceptor
service.interceptors.response.use(
    response => {
        if (response.headers['token']) {
            store.commit('changeToken', response.headers['token'])
        };
        return response
    },
    (error) => {
        if (Object.prototype.toString.call(error.response) === '[object Object]') {
            if (error.response.hasOwnProperty('status')) {
                if (error.response.status === 401) {
                    removeAllLocalStorage();
                    if(store.getters.globalTimer) {window.clearInterval(this.globalTimer)};
                    if (!store.getters.overDueWay) {
                        Toast({
                            message: 'token已过期,请重新登录',
                            duration: 1000
                        });
                        setTimeout(() => {
                            router.push({
                                path: "/"
                            })
                        }, 2000);
                    } else {
                        router.push({
                            path: "/"
                        })
                    }
                }
            }
        };
        // 处理响应错误
        var config = error.config;
        // 判断是否配置了重试
        if (!config || !config.retry) {
            if (Object.prototype.toString.call(error.response) === '[object Object]') {
                if (error.response.hasOwnProperty('data')) {
                    if (error.response.data.hasOwnProperty('msg')) {
                        return Promise.reject(error.response.data.msg)
                    } else if (error.response.data.hasOwnProperty('message')) {
                        return Promise.reject(error.response.data.message)
                    } else {
                        return Promise.reject(error.response.data)
                    }
                } else {
                    return Promise.reject(error.response)
                }
            } else {
                return Promise.reject(error)
            }
        };
        if (!config.shouldRetry || typeof config.shouldRetry != 'function') {
            if (Object.prototype.toString.call(error.response) === '[object Object]') {
                if (error.response.hasOwnProperty('data')) {
                    if (error.response.data.hasOwnProperty('msg')) {
                        return Promise.reject(error.response.data.msg)
                    } else if (error.response.data.hasOwnProperty('message')) {
                        return Promise.reject(error.response.data.message)
                    } else {
                        return Promise.reject(error.response.data)
                    }
                } else {
                    return Promise.reject(error.response)
                }
            } else {
                return Promise.reject(error)
            }
        };
        //判断是否满足重试条件
        if (!config.shouldRetry(error)) {
            if (Object.prototype.toString.call(error.response) === '[object Object]') {
                if (error.response.hasOwnProperty('data')) {
                    if (error.response.data.hasOwnProperty('msg')) {
                        return Promise.reject(error.response.data.msg)
                    } else if (error.response.data.hasOwnProperty('message')) {
                        return Promise.reject(error.response.data.message)
                    } else {
                        return Promise.reject(error.response.data)
                    }
                } else {
                    return Promise.reject(error.response)
                }
            } else {
                return Promise.reject(error)
            }
        };
        // 设置重置次数，默认为0
        config.__retryCount = config.__retryCount || 0;
        // 判断是否超过了重试次数
        if (config.__retryCount > config.retry) {
            if (Object.prototype.toString.call(error.response) === '[object Object]') {
                if (error.response.hasOwnProperty('data')) {
                    if (error.response.data.hasOwnProperty('msg')) {
                        return Promise.reject(error.response.data.msg)
                    } else if (error.response.data.hasOwnProperty('message')) {
                        return Promise.reject(error.response.data.message)
                    } else {
                        return Promise.reject(error.response.data)
                    }
                } else {
                    return Promise.reject(error.response)
                }
            } else {
                return Promise.reject(error)
            }
        };
        //重试次数自增
        config.__retryCount += 1;
        //延时处理
        var backoff = new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, config.retryDelay || 1);
        });
        //重新发起axios请求
        return backoff.then(function() {
            return service(config);
        })
    }
);

export default service