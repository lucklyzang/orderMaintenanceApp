import { setStore, getStore } from '@/common/js/utils'
import { getDefaultEventRegisterState } from '@/common/js/resetStore'
export default {
    state: getDefaultEventRegisterState(),

    getters: {

        temporaryStorageRepairsRegisterMessage: (state) => {
            return state.temporaryStorageRepairsRegisterMessage
        },

        eventRegisterType: (state) => {
            return state.enterEventRegisterPageMessage
        } 
    },

    mutations: {
        // 保存事件登记(工程报修)信息
        changeTemporaryStorageRepairsRegisterMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                state.temporaryStorageRepairsRegisterMessage = playLoad
            }
        },

        // 保存进入事件登记页的信息
        changeEnterEventRegisterPageMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                state.enterEventRegisterPageMessage = playLoad
            }
        },

        //重置事件登记模块状态
        resetRegisterState(state) {
            Object.assign(state, getDefaultEventRegisterState())
        }
    },

    actions: {
        resetRegisterStore({ commit }) {
            commit('resetRegisterState')
        }
    }
}