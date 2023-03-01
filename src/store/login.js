import { setStore, getStore } from '@/common/js/utils'
import { getDefaultLoginState } from '@/common/js/resetStore'
export default {
    state: getDefaultLoginState(),

    getters: {
        userInfo: (state) => {
            state.userInfo = JSON.parse(getStore('userInfo')) ? JSON.parse(getStore('userInfo')) : null;
            return state.userInfo
        },

        hospitalMessage: (state) => {
            return state.hospitalMessage
        },

        globalTimer: state => state.globalTimer,

        token: (state) => {
            state.token = getStore('token') ? getStore('token') : null;
            return state.token
        },

        permissionInfo: (state) => {
            state.permissionInfo = JSON.parse(getStore('permissionInfo')) ? JSON.parse(getStore('permissionInfo')) : [];
            return state.permissionInfo
        },

        chooseProject: (state) => {
            state.chooseProject = JSON.parse(getStore('chooseProject')) ? JSON.parse(getStore('chooseProject')) : [];
            return state.chooseProject
        },

        roleNameList: (state) => {
            state.roleNameList = JSON.parse(getStore('roleNameList')) ? JSON.parse(getStore('roleNameList')) : [];
            return state.roleNameList
        },

        timeMessage: (state) => {
            state.timeMessage = JSON.parse(getStore('timeMessage')) ? JSON.parse(getStore('timeMessage')) : {};
            return state.timeMessage
        },
        
        ossMessage: (state) => {
            state.ossMessage = JSON.parse(getStore('ossMessage')) ? JSON.parse(getStore('ossMessage')) : {};
            return state.ossMessage
        },
        

        isLogin: (state) => {
            state.isLogin = getStore('isLogin') ? getStore('isLogin') === 'false' ? false : true : false;
            return state.isLogin
        },

        overDueWay: (state) => {
            state.overDueWay = getStore('overDueWay') ? getStore('overDueWay') === 'false' ? false : true : false;
            return state.overDueWay
        }
    },

    mutations: {

        // 保存用户信息
        storeUserInfo(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('userInfo', playLoad);
                state.userInfo = playLoad
            }
        },

        // 保存全局定时器的状态
        changeGlobalTimer (state, playLoad) {
            state.globalTimer = playLoad
        },

        // 保存医院信息
        changeHospitalMessage (state, playLoad) {
            state.hospitalMessage = playLoad
        },

        // 保存token
        changeToken(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('token', playLoad);
                state.token = playLoad
            }
        },

        // 保存用户登录状态
        changeIsLogin(state, playLoad) {
            if (playLoad != 'null') {
                setStore('isLogin', playLoad);
                state.isLogin = playLoad
            }
        },

        // 保存权限列表
		changePermissionInfo(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('permissionInfo', playLoad);
                state.permissionInfo = playLoad
            }
		},

        // 保存角色列表
		changeRoleNameList(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('roleNameList', playLoad);
                state.roleNameList = playLoad
            }
		},

        // 保存过期方式
		changeOverDueWay(state, playLoad) {
            if (playLoad != 'null') {
                setStore('overDueWay', playLoad);
                state.overDueWay = playLoad
            }
		},

        //保存阿里云签名过期日期
        changeTimeMessage (state, playLoad) {
            if (playLoad != 'null') {
                setStore('timeMessage', playLoad);
                state.timeMessage = playLoad
            }
		},

         //保存阿里云签名信息
         changeOssMessage (state, playLoad) {
            if (playLoad != 'null') {
                setStore('ossMessage', playLoad);
                state.ossMessage = playLoad
            }
		},

        //保存选择的项目
        changeChooseProject (state, playLoad) {
            if (playLoad != 'null') {
                setStore('chooseProject', playLoad);
                state.chooseProject = playLoad
            }
		},

        //重置login的store
        resetState(state) {
            Object.assign(state, getDefaultLoginState())
        }
    },    

    actions: {
        resetLoginState({ commit }) {
            commit('resetState')
        }
    }
}