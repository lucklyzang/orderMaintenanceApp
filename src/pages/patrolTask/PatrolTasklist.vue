<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">加载中...</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <div class="nav">
        <van-nav-bar title="巡更任务" left-text="返回" left-arrow @click-left="onClickLeft" @click-right="onClickRight" right-text="留言簿" :border="false">
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
        <div class="content-box">
            <van-tabs v-model="activeName" color="#1684FC" title-inactive-color="#BEC7D1" title-active-color="#1684FC" @change="vanTabsChangeEvent">
                <van-tab title="待办任务" name="backlogTask">
                    <van-empty description="暂无数据" v-show="backlogEmptyShow" />
                    <div class="backlog-task-list-box" ref="scrollBacklogTask" v-show="!backlogEmptyShow">
                        <div class="backlog-task-list" v-for="(item,index) in fullBacklogTaskList" :key="index">
                            <div class="backlog-task-top">
                                <div class="backlog-task-top-left">
                                    <span>任务编号</span>
                                    <span>{{ item.number }}</span>
                                </div>
                                <div class="backlog-task-top-right">
                                    <span :class="{'spanNoStartStyle': item.state == 1,'spanCompletedStyle': item.state == 4}">{{ taskStatusTransition(item.state) }}</span>
                                </div>
                            </div>
                            <div class="backlog-task-content">
                                <div class="taskset-name">
                                    <span>任务集名称:</span>
                                    <span>{{ item.configName }}</span>
                                </div>
                                <div class="taskset-create-time-type">
                                    <span>任务集生成时间类型:</span>
                                    <span>{{ taskSetTransition(item.type) }}</span>
                                </div>
                                <div class="task-create-time">
                                    <span>预计开始时间:</span>
                                    <span>{{ item.planStartTimeForApp }}</span>
                                </div>
                                <div class="complete-patrol-area">
                                    <span>已完成巡查区域:</span>
                                    <span>{{ `${item.finishSpacesCount}/${item.allSpacesCount}` }}</span>
                                </div>
                                <div class="right-arrow-box" @click="taskDetailsEvent(item)">
                                    <van-icon name="arrow" color="#1684FC" size="24" />
                                </div>
                            </div>
                        </div>
                        <div class="no-more-data" v-show="isShowBacklogTaskNoMoreData">没有更多数据了!</div>
                    </div>    
                </van-tab>
                <van-tab title="历史任务" name="completetedTask">
                    <van-empty description="暂无数据" v-show="completedEmptyShow" />
                    <div class="backlog-task-list-box" ref="scrollCompletetedTask" v-show="!completedEmptyShow">
                        <div class="backlog-task-list" v-for="(item,index) in fullCompletedTaskList" :key="index">
                            <div class="backlog-task-top">
                                <div class="backlog-task-top-left">
                                    <span>任务编号</span>
                                    <span>{{ item.number }}</span>
                                </div>
                                <div class="backlog-task-top-right">
                                    <span :class="{'spanNoStartStyle': item.state == 1,'spanCompletedStyle': item.state == 4}">{{ taskStatusTransition(item.state) }}</span>
                                </div>
                            </div>
                            <div class="backlog-task-content">
                                <div class="taskset-name">
                                    <span>任务集名称:</span>
                                    <span>{{ item.configName }}</span>
                                </div>
                                <div class="taskset-create-time-type">
                                    <span>任务集生成时间类型:</span>
                                    <span>{{ taskSetTransition(item.type) }}</span>
                                </div>
                                <div class="task-create-time">
                                    <span>预计开始时间:</span>
                                    <span>{{ item.planStartTimeForApp }}</span>
                                </div>
                                <div class="complete-patrol-area">
                                    <span>已完成巡查区域:</span>
                                    <span>{{ `${item.finishSpacesCount}/${item.allSpacesCount}` }}</span>
                                </div>
                                <div class="right-arrow-box" @click="taskDetailsEvent(item)">
                                    <van-icon name="arrow" color="#1684FC" size="24" />
                                </div>
                            </div>
                        </div>
                        <div class="no-more-data" v-show="isShowCompletetedTaskNoMoreData">没有更多数据了!</div>
                    </div>    
                </van-tab>
            </van-tabs>
        </div>
    </div> 
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {getAllTaskList} from '@/api/escortManagement.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
export default {
  name: "PatrolTasklist",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      overlayShow: false,
      backlogEmptyShow: false,
      completedEmptyShow: false,
      totalCount: '',
      backlogTaskTimer: 0,
      completetedTaskTimer: 0,
      timeOne: null,
      timeTwo: null,
      currentPage: 1,
      pageSize: 10,
      isShowBacklogTaskNoMoreData: false,
      isShowCompletetedTaskNoMoreData: false,
      activeName: 'backlogTask',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      fullBacklogTaskList: [],
      fullCompletedTaskList: [],
      backlogTaskList: [],
      completedTaskList: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/home');
    this.$nextTick(()=> {
       this.initBacklogTaskScrollChange()
    })
  },

  beforeDestroy () {
    if (this.timeOne) {
        clearTimeout(this.timeOne)
    };
    if (this.timeTwo) {
        clearTimeout(this.timeTwo)
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm=>{
      if (from.path == '/home') {
        vm.queryTaskList(1,vm.currentPage,vm.pageSize)
      } else {
        if (vm.taskType.taskTypeName) {
            vm.activeName = vm.taskType.taskTypeName
        };
        vm.queryTaskList(vm.taskType.taskTypeName ? vm.taskType.taskTypeName == 'backlogTask' ? 1 : 2 : 1,vm.currentPage,vm.pageSize)
      }
	});
    next() 
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","taskType"])
  },

  methods: {
    ...mapMutations(["changePatrolTaskListMessage","changeTaskType"]),

    onClickLeft () {
        this.$router.push({path: '/home'})
    },

    onClickRight () {
        this.$router.push({path: '/postMessage'})
    },

    // 任务状态转换
    taskStatusTransition (num) {
        switch(num) {
            case 1 :
                return '未开始'
                break;
            case 2 :
                return '进行中'
                break;
            case 3 :
                return '待签字'
                break;
            case 4 :
                return '已完成'
                break;
        }
    },

    // 任务集类型转换
    taskSetTransition (num) {
        switch(num) {
            case '1' :
                return '每天'
                break;
            case '2' :
                return '每周'
                break;
            case '3' :
                return '工作日'
                break;
            case '4' :
                return '节假日和周末'
                break;
        }
    },

    // 给待办任务添加滚动事件
    initBacklogTaskScrollChange () {
        let boxBackScroll = this.$refs['scrollBacklogTask'];
        boxBackScroll.addEventListener('scroll',this.backlogTaskLoadingMethods,true)
    },

    // 待办任务加载函数
    backlogTaskLoadingMethods () {
        let boxBackScroll = this.$refs['scrollBacklogTask'];
        if (boxBackScroll.scrollTop == 0) {return};
        if (Math.ceil(boxBackScroll.scrollTop + boxBackScroll.offsetHeight) >= boxBackScroll.scrollHeight) {
            if (this.backlogTaskTimer) {return};
            this.backlogTaskTimer = 1;
            this.timeOne = setTimeout(() => {
                let totalPage = Math.ceil(this.totalCount/this.pageSize);
                if (this.currentPage >= totalPage) {
                    this.isShowBacklogTaskNoMoreData = true
                } else {
                    this.isShowCompletetedTaskNoMoreData = false;
                    this.currentPage = this.currentPage + 1;
                    this.queryTaskList(1,this.currentPage,this.pageSize);
                };
                this.backlogTaskTimer = 0;
                console.log('待办加载了',boxBackScroll.scrollTop, boxBackScroll.offsetHeight, boxBackScroll.scrollHeight);
            },300)
        }     
    },

    // 给完成任务添加滚动事件
    initCompletetedTaskScrollChange () {
        let boxCompleteteScroll = this.$refs['scrollCompletetedTask'];
        boxCompleteteScroll.addEventListener('scroll',this.completetedTaskLoadingMethods,true)
    },

    // 完成任务加载函数
    completetedTaskLoadingMethods () {
        let boxCompleteteScroll = this.$refs['scrollCompletetedTask'];
        if (boxCompleteteScroll.scrollTop == 0) {return};
        if (Math.ceil(boxCompleteteScroll.scrollTop + boxCompleteteScroll.offsetHeight) >= boxCompleteteScroll.scrollHeight) {
            if (this.completetedTaskTimer) {return};
            this.completetedTaskTimer = 1;
            this.timeTwo = setTimeout(() => {
                let totalPage = Math.ceil(this.totalCount/this.pageSize);
                if (this.currentPage >= totalPage) {
                    this.isShowCompletetedTaskNoMoreData = true
                } else {
                    this.isShowCompletetedTaskNoMoreData = false;
                    this.currentPage = this.currentPage + 1;
                    this.queryTaskList(2,this.currentPage,this.pageSize);
                };
                this.completetedTaskTimer = 0;
                console.log('完成滚动了',boxCompleteteScroll.scrollTop, boxCompleteteScroll.offsetHeight, boxCompleteteScroll.scrollHeight)
            },300)
        }
    },

    // 获取任务列表
    queryTaskList (taskType,page,pageSize) {
        this.loadingShow = true;
        this.overlayShow = true;
        this.backlogEmptyShow = false;
        this.completedEmptyShow = false;
        this.isShowBacklogTaskNoMoreData = false;
        this.isShowBacklogTaskNoMoreData = false;
		getAllTaskList({proId : this.userInfo.proIds[0], workerId: this.userInfo.id,taskType,system:4,page,pageSize})
        .then((res) => {
            this.loadingShow = false;
            this.overlayShow = false;
            if (res && res.data.code == 200) {
                if (taskType == 1) {
                    this.backlogTaskList = res.data.data.list;
                    this.totalCount = res.data.data.total;
                    let totalPage = Math.ceil(this.totalCount/pageSize);
                    if (page >= totalPage) {
                        this.isShowBacklogTaskNoMoreData = true
                    } else {
                        this.isShowBacklogTaskNoMoreData = false
                    };
                    this.fullBacklogTaskList = this.fullBacklogTaskList.concat(this.backlogTaskList);
                    if (this.fullBacklogTaskList.length == 0) {
                        this.backlogEmptyShow = true
                    }
                } else if (taskType == 2) {
                    this.completedTaskList = res.data.data.list;
                    this.totalCount = res.data.data.total;
                    let totalPage = Math.ceil(this.totalCount/pageSize);
                    if (page >= totalPage) {
                        this.isShowBacklogTaskNoMoreData = true
                    } else {
                        this.isShowBacklogTaskNoMoreData = false
                    };
                    this.fullCompletedTaskList = this.fullCompletedTaskList.concat(this.completedTaskList);
                    if (this.fullCompletedTaskList.length == 0) {
                        this.completedEmptyShow = true
                    }
                }
            } else {
            this.$toast({
                type: 'fail',
                message: res.data.msg
            })
            }
      })
      .catch((err) => {
        this.loadingShow = false;
        this.overlayShow = false;
        this.$toast({
          type: 'fail',
          message: err
        })
      })
    },

    // tab切换值变化事件
    vanTabsChangeEvent (value) {
        this.currentPage = 1;
        this.pageSize = 10;
        this.fullBacklogTaskList = [];
        this.fullCompletedTaskList = [];
        let temporaryText;
        if (value == 'backlogTask') {
            temporaryText = 1;
        } else if (value == 'completetedTask') {
            temporaryText = 2;
            this.$nextTick(()=> {
                this.initCompletetedTaskScrollChange()
            })
        };
        this.queryTaskList(temporaryText,this.currentPage,this.pageSize)
    },

    // 点击进入任务详情事件
    taskDetailsEvent (item) {
        this.changePatrolTaskListMessage(item);
        let temporaryMessage = this.taskType;
        temporaryMessage['taskTypeName'] = this.activeName;
        this.changeTaskType(temporaryMessage);
        this.$router.push('/workOrderDetails')
    }
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  .content-wrapper();
  .nav {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 10;
    left: 0;
    /deep/ .van-nav-bar {
        background: transparent !important;
        .van-nav-bar__left {
            .van-nav-bar__text {
              color: #fff !important;
              margin-left: 8px !important;
            };
            .van-icon {
              color: #fff !important;
            }
        };
        .van-nav-bar__right {
          .van-nav-bar__text {
            color: #fff
          }
        };
        .van-nav-bar__title {
          color: #fff !important;
          font-size: 16px !important;
        }
    }
  };
  /deep/ .van-loading {
    z-index: 1000000
  };  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    .content-top-area {
      width: 100%;
      margin: 0 auto;
      height: 189px;
      position: absolute;
      top: 0;
      left: 0;
      > img {
        width: 100%;
        height: 100%
      }
    };
    .content-box {
        flex: 1;
        margin-top: 50px;
        box-sizing: border-box;
        background: #F7F7F7;
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding-bottom: 50px;
        /deep/ .van-tabs {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 0;
            .van-tabs__wrap {
                .bottom-border-1px(#BEC7D1)
            };
            .van-tabs__content {
                flex: 1;
                padding: 8px 4px 0px 4px;
                box-sizing: border-box;
                background: #f7f7f7;
                overflow: scroll;
                .van-tab__pane {
                    height: 100%;
                    position: relative;
                    .van-empty {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%,-50%)
                    };
                    .backlog-task-list-box {
                        overflow: scroll;
                        height: 100%;
                        .backlog-task-list {
                            padding: 0 8px 4px 8px;
                            box-sizing: border-box;
                            border-radius: 6px;
                            background: #fff;
                            box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.23);
                            margin-bottom: 10px;
                            .backlog-task-top {
                                height: 40px;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                font-size: 14px;
                                color: #1684FC;
                                .bottom-border-1px(#BEC7D1);
                                .backlog-task-top-left {
                                    flex: 1;
                                    .no-wrap()
                                };
                                .backlog-task-top-right {
                                    width: 70px;
                                    text-align: center;
                                    span {
                                        display: inline-block;
                                        width: 62px;
                                        height: 22px;
                                        text-align: center;
                                        line-height: 22px;
                                        background: #289E8E;
                                        color: #fff;
                                        border-radius: 6px;
                                    };
                                    .spanNoStartStyle {
                                        background: #174E97;
                                    };
                                    .spanCompletedStyle {
                                        background: #101010;
                                    }
                                }
                            };
                            .backlog-task-content {
                                position: relative;
                                .right-arrow-box {
                                    position: absolute;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    right: 8px;
                                    top: 50%;
                                    transform: translateY(-50%)
                                };
                                >div {
                                line-height: 28px;
                                word-break: break-all;
                                font-size: 14px;
                                color: #101010  
                                };
                                .taskset-name {
                                    color: #1684FC
                                };
                                .complete-patrol-area {
                                    >span {
                                        &:nth-child(2) {
                                            color: #1684FC
                                        }
                                    }
                                };
                                .unfinished-patrol-area {
                                    >span {
                                        &:nth-child(2) {
                                            color: #1684FC
                                        }
                                    }
                                }
                            }
                        };
                        .no-more-data {
                            font-size: 12px;
                            color: #BEC7D1;
                            width: 100%;
                            text-align: center;
                            line-height: 30px
                        }
                    }
                }        
            }
        }
    }
  }
}
</style>