import Vue from 'vue';
import Vuex from 'vuex';
import login from './login.js';
import escortManagement from './escortManagement.js';
Vue.use(Vuex);
export default new Vuex.Store({
    modules: {
        login,
        escortManagement
    }
});