import Vue from 'vue'
import Router from 'vue-router'
import { getStore } from '@/common/js/utils.js'
import store from '@/store'
const Home = () =>
    import ('@/pages/Home')
const Login = () =>
    import ('@/pages/Login')
const MyInfo = () =>
    import ('@/pages/MyInfo')
const ElectronicSignaturePage = () =>
    import ('@/pages/ElectronicSignaturePage')
const PatrolTasklist = () =>
    import ('@/pages/patrolTask/PatrolTasklist')
const WorkOrderDetails = () =>
    import ('@/pages/patrolTask/WorkOrderDetails')
const ProblemRecord = () =>
    import ('@/pages/patrolTask/ProblemRecord')
const AreaPatrolDetails = () =>
    import ('@/pages/patrolTask/AreaPatrolDetails')
const EventList = () =>
    import ('@/pages/eventPage/EventList')
const RepairsRegister = () =>
    import ('@/pages/eventPage/RepairsRegister')
const OtherRegister = () =>
    import ('@/pages/eventPage/OtherRegister')
const ClaimRegister = () =>
    import ('@/pages/eventPage/ClaimRegister')
const GuestBook = () =>
    import ('@/pages/guestBookPage/GuestBook')
const PostMessage = () =>
    import ('@/pages/guestBookPage/postMessage')
const HistoryClaimRegister = () =>
    import ('@/pages/eventPage/HistoryClaimRegister')
const MoreHistoryClaimRegister = () =>
    import ('@/pages/eventPage/MoreHistoryClaimRegister')
const HistoryRepairsRegister = () =>
    import ('@/pages/eventPage/HistoryRepairsRegister')
const MoreHistoryRepairsRegister = () =>
    import ('@/pages/eventPage/MoreHistoryRepairsRegister')
const HistoryOtherRegister = () =>
    import ('@/pages/eventPage/HistoryOtherRegister')
const MoreHistoryOtherRegister = () =>
    import ('@/pages/eventPage/MoreHistoryOtherRegister')
Vue.use(Router)
let baseRoute = [{
        path: '/',
        name: 'login',
        component: Login
    },
    {
        path: '/home',
        name: 'home',
        component: Home
    },
    {
        path: '/electronicSignaturePage',
        name: 'electronicSignaturePage',
        component: ElectronicSignaturePage
    },
    {
        path: '/myInfo',
        name: 'myInfo',
        component: MyInfo
    },
    {
        path: '/patrolTasklist',
        name: 'patrolTasklist',
        component: PatrolTasklist
    },
    {
        path: '/workOrderDetails',
        name: 'workOrderDetails',
        component: WorkOrderDetails
    },
    {
        path: '/problemRecord',
        name: 'problemRecord',
        component: ProblemRecord
    },
    {
        path: '/areaPatrolDetails',
        name: 'areaPatrolDetails',
        component: AreaPatrolDetails,
        meta: {
            keepAlive: true
        }
    },
    {
        path: '/eventList',
        name: 'eventList',
        component: EventList

    },
    {
        path: '/repairsRegister',
        name: 'repairsRegister',
        component: RepairsRegister

    },
    {
        path: '/otherRegister',
        name: 'otherRegister',
        component: OtherRegister

    },
    {
        path: '/claimRegister',
        name: 'claimRegister',
        component: ClaimRegister

    },
    {
        path: '/historyClaimRegister',
        name: 'historyClaimRegister',
        component: HistoryClaimRegister

    },
    {
        path: '/guestBook',
        name: 'guestBook',
        component: GuestBook

    },
    {
        path: '/postMessage',
        name: 'postMessage',
        component: PostMessage

    },
    {
        path: '/moreHistoryClaimRegister',
        name: 'moreHistoryClaimRegister',
        component: MoreHistoryClaimRegister

    },
    {
        path: '/historyRepairsRegister',
        name: 'historyRepairsRegister',
        component: HistoryRepairsRegister

    },
    {
        path: '/moreHistoryRepairsRegister',
        name: 'moreHistoryRepairsRegister',
        component: MoreHistoryRepairsRegister

    },
    {
        path: '/historyOtherRegister',
        name: 'historyOtherRegister',
        component: HistoryOtherRegister

    },
    {
        path: '/moreHistoryOtherRegister',
        name: 'moreHistoryOtherRegister',
        component: MoreHistoryOtherRegister

    }
];
let router = new Router({
    routes: baseRoute,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            // return {
            //     x: 0,
            //     y: 0
            // }
        }
    }
});
router.beforeEach((to, from, next) => {
    let login = getStore('isLogin');
    let name = to.name;
    if (name === 'login') {
        if (login) {
            next({ path: '/home' })
        } else {
            next()
        }
    } else {
        if (login) {
            next()
        } else {
            next({ path: '/' })
        }
    }
});
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
};
export default router