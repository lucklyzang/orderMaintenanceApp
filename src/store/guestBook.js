import { setStore, getStore } from '@/common/js/utils'
import { getDefaultGuestbookState } from '@/common/js/resetStore'
export default {
    state: getDefaultGuestbookState(),

    getters: {

        enterPostMessagePageMessage: (state) => {
            return state.enterPostMessagePageMessage
        },

        isEnterGuestBookPageFromHomePage: (state) => {
            return state.isEnterGuestBookPageFromHomePage
        },

        lastMessageNumber: (state) => {
            return state.lastMessageNumber
        },
    },

    mutations: {

        // 保存进入留言发布页的信息
        changeEnterPostMessagePageMessage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                state.enterPostMessagePageMessage = playLoad
            }
        },

        // 保存是否从首页进入过留言簿页的信息
        changeIsEnterGuestBookPageFromHomePage(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                state.isEnterGuestBookPageFromHomePage = playLoad
            }
        },

        // 保存上次留言数量
        changeLastMessageNumber(state, playLoad) {
            if (playLoad && playLoad != 'null') {
                state.lastMessageNumber = playLoad
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