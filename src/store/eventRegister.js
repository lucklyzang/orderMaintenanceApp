import { setStore, getStore } from '@/common/js/utils'
import { getDefaultEventRegisterState } from '@/common/js/resetStore'
export default {
    state: getDefaultEventRegisterState(),

    getters: {

        temporaryStorageRepairsRegisterMessage: (state) => {
            return state.temporaryStorageRepairsRegisterMessage
        },

        eventRegisterType: (state) => {
            return state.eventRegisterType
        } 
    },

    mutations: {
        // 保存报修登记信息
        changeTemporaryStorageRepairsRegisterMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                state.temporaryStorageRepairsRegisterMessage = playLoad
            }
        },

        // 保存事件登记类型信息
        changeEventRegisterType(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                state.eventRegisterType = playLoad
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