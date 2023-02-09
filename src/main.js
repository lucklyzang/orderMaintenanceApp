import Vue from 'vue'
import router from './router'
import store from './store'
import VueClipboard from 'vue-clipboard2'
import Vant from 'vant';
import 'vant/lib/index.css';
import moment from 'moment'

import Create from '@/common/js/create.js';
import Alert from '@/components/LightHint.vue';
Vue.config.productionTip = false;
Vue.prototype.$Alert= ((obj)=>{//挂载在原型上
return Create(Alert,obj).show(); //返回组件实例
})

import { IsPC } from '@/common/js/utils.js'
import '@/directives/preventReClick.js'
if (process.env.NODE_ENV == 'development') {
    Vue.config.devtools = true;
} else {
    Vue.config.devtools = false;
};

import VueLazyLoad from 'vue-lazyload';

Vue.prototype.Base64 = require('js-base64').Base64;

// 全局挂载时间格式化方法
Vue.filter('dateformat', function(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
    return moment(dataStr).format(pattern)
});

//处理移动端click事件300ms延迟
import FastClick from 'fastclick'
FastClick.attach(document.body);
FastClick.prototype.focus = function(targetElement) {
    targetElement.focus();
};
Vue.prototype.$moment = moment;

// 全局挂载监听设备物理返回按键的方法
function gotoURL(callback) {
    window.onpopstate = null;
    window.onpopstate = function() {
        callback()
    }
}
Vue.prototype.gotoURL = gotoURL;

//初始化样式
import './common/stylus/index.less'

//移动端适配
import 'lib-flexible/flexible'
import App from './App'

// vue剪切板功能
Vue.use(VueClipboard);

Vue.use(Vant);

// 图片懒加载
Vue.use(VueLazyLoad, {
    preLoad: 1.3,
    loading: './static/img/img-loading.gif',
    error: './static/img/img-error.jpeg',
    attempt: 2
});

Vue.config.productionTip = false;

if (IsPC()) {
    // Vue.use(new VueSocketIO({
    //    debug: true,
    //    connection: 'http://localhost:10001'
    // }))
};
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    created() {},
    template: '<App/>'
})