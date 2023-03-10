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

        // ??????????????????
        storeUserInfo(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('userInfo', playLoad);
                state.userInfo = playLoad
            }
        },

        // ??????????????????????????????
        changeGlobalTimer (state, playLoad) {
            state.globalTimer = playLoad
        },

        // ??????????????????
        changeHospitalMessage (state, playLoad) {
            state.hospitalMessage = playLoad
        },

        // ??????token
        changeToken(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('token', playLoad);
                state.token = playLoad
            }
        },

        // ????????????????????????
        changeIsLogin(state, playLoad) {
            if (playLoad != 'null') {
                setStore('isLogin', playLoad);
                state.isLogin = playLoad
            }
        },

        // ??????????????????
		changePermissionInfo(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('permissionInfo', playLoad);
                state.permissionInfo = playLoad
            }
		},

        // ??????????????????
		changeRoleNameList(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                setStore('roleNameList', playLoad);
                state.roleNameList = playLoad
            }
		},

        // ??????????????????
		changeOverDueWay(state, playLoad) {
            if (playLoad != 'null') {
                setStore('overDueWay', playLoad);
                state.overDueWay = playLoad
            }
		},

        //?????????????????????????????????
        changeTimeMessage (state, playLoad) {
            if (playLoad != 'null') {
                setStore('timeMessage', playLoad);
                state.timeMessage = playLoad
            }
		},

         //???????????????????????????
         changeOssMessage (state, playLoad) {
            if (playLoad != 'null') {
                setStore('ossMessage', playLoad);
                state.ossMessage = playLoad
            }
		},

        //?????????????????????
        changeChooseProject (state, playLoad) {
            if (playLoad != 'null') {
                setStore('chooseProject', playLoad);
                state.chooseProject = playLoad
            }
		},

        //??????login???store
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