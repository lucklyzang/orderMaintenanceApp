import { setStore, getStore } from '@/common/js/utils'
import { getDefaultGuestbookState } from '@/common/js/resetStore'
export default {
    state: getDefaultGuestbookState(),

    getters: {

        enterPostMessagePageMessage: (state) => {
            return state.enterPostMessagePageMessage
        }
    },

    mutations: {

        // 保存进入留言发布页的信息
        changeEnterPostMessagePageMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                state.enterPostMessagePageMessage = playLoad
            }
        },

        //重置留言簿模块状态
        resetGuestbookState(state) {
            Object.assign(state, getDefaultGuestbookState())
        }
    },

    actions: {
        resetGuestbookStore({ commit }) {
            commit('resetRegisterState')
        }
    }
}