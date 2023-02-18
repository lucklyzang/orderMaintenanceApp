import Vue from 'vue';
import Vuex from 'vuex';
import login from './login.js';
import patrolTask from './patrolTask.js';
import eventRegister from './eventRegister.js';
import guestBook from './guestBook.js';
Vue.use(Vuex);
export default new Vuex.Store({
    modules: {
        login,
        patrolTask,
        eventRegister,
        guestBook
    }
});