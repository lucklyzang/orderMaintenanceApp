<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">加载中...</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <div class="nav">
        <NavBar path="/workOrderDetails" title="问题列表页" />
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
        <div class="content-box">
            <van-tabs v-model="activeName" color="#1684FC" title-inactive-color="#BEC7D1" title-active-color="#1684FC" @change="vanTabsChangeEvent">
                <van-tab title="本次任务" name="currentTask">
                    <van-empty description="暂无数据" v-show="currentTaskOrderEmptyShow" />
                    <div class="backlog-task-list" v-for="(item,index) in currentTaskProblemOrderList" :key="index" v-show="!currentTaskOrderEmptyShow">
                        <div class="backlog-task-top">
                            <div class="backlog-task-top-left">
                                <span>任务编号</span>
                                <span>{{ item.taskNumber }}</span>
                            </div>
                            <div class="backlog-task-top-right">
                                <span :class="{'spanNoStartStyle': item.taskState == 1,'spanCompletedStyle': item.taskState == 4}">{{ taskStatusTransition(item.taskState) }}</span>
                            </div>
                        </div>
                        <div class="backlog-task-content">
                            <div class="inspect-item">
                                <span>巡查项:</span>
                                <span>{{ item.itemName }}</span>
                            </div>
                            <div class="taskset-name">
                                <span>任务集名称:</span>
                                <span>{{ item.configName }}</span>
                            </div>
                            <div class="task-create-time">
                                <span>任务生成时间:</span>
                                <span>{{ item.taskCreateTime }}</span>
                            </div>
                            <div class="complete-patrol-area">
                                <span>区域:</span>
                                <span>{{ item.spaceName }}</span>
                            </div>
                            <div class="unfinished-patrol-area">
                                <span>检查时间:</span>
                                <span>{{ item.checkTime }}</span>
                            </div>
                            <div class="taskset-number">
                                <span>任务集编号:</span>
                                <span>{{ item.configNumber }}</span>
                            </div>
                            <div class="right-arrow-box" @click="problemRecordEvent(item)">
                                <van-icon name="arrow" color="#1684FC" size="24" />
                            </div>
                        </div>
                    </div>
                </van-tab>
                <van-tab title="全部任务" name="allTask">
                    <van-empty description="暂无数据" v-show="allTaskOrderEmptyShow" />
                    <div class="backlog-task-list" v-for="(item,index) in allTaskProblemOrderList" :key="index" v-show="!allTaskOrderEmptyShow">
                        <div class="backlog-task-top">
                            <div class="backlog-task-top-left">
                                <span>任务编号</span>
                                <span>{{ item.taskNumber }}</span>
                            </div>
                            <div class="backlog-task-top-right">
                                <span :class="{'spanNoStartStyle': item.taskState == 1,'spanCompletedStyle': item.taskState == 4}">{{ taskStatusTransition(item.taskState) }}</span>
                            </div>
                        </div>
                        <div class="backlog-task-content">
                            <div class="inspect-item">
                                <span>巡查项:</span>
                                <span>{{ item.itemName }}</span>
                            </div>
                            <div class="taskset-name">
                                <span>任务集名称:</span>
                                <span>{{ item.configName }}</span>
                            </div>
                            <div class="task-create-time">
                                <span>任务生成时间:</span>
                                <span>{{ item.taskCreateTime }}</span>
                            </div>
                            <div class="complete-patrol-area">
                                <span>区域:</span>
                                <span>{{ item.spaceName }}</span>
                            </div>
                            <div class="unfinished-patrol-area">
                                <span>检查时间:</span>
                                <span>{{ item.checkTime }}</span>
                            </div>
                            <div class="taskset-number">
                                <span>任务集编号:</span>
                                <span>{{ item.configNumber }}</span>
                            </div>
                            <div class="right-arrow-box" @click="problemRecordEvent(item)">
                                <van-icon name="arrow" color="#1684FC" size="24" />
                            </div>
                        </div>
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
import {getCurrentTaskProblemWorkerOrder, getAllTaskProblemWorkerOrder} from '@/api/escortManagement.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
export default {
  name: "QuestionList",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      overlayShow: false,
      currentTaskOrderEmptyShow: false,
      allTaskOrderEmptyShow: false,
      activeName: 'currentTask',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      currentTaskProblemOrderList: [],
      allTaskProblemOrderList: []
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/workOrderDetails")
  },

  beforeRouteEnter(to, from, next) {
    next(vm=>{
      if (from.path == '/workOrderDetails') {
        vm.queryCurrentTaskProblemWorkerOrder(vm.patrolTaskListMessage.id)
      } else {
        if (vm.taskOrderType.taskTypeName) {
            vm.activeName = vm.taskOrderType.taskTypeName;
            if (vm.activeName == 'currentTask') {
                vm.queryCurrentTaskProblemWorkerOrder(vm.patrolTaskListMessage.id)
            } else {
                vm.queryAllTaskProblemWorkerOrder({
                    proId: vm.userInfo.hospitalList[0]['hospitalId'], // 项目id
                    workerId: vm.userInfo.id
                })  
            }
        } else {
            vm.queryCurrentTaskProblemWorkerOrder(vm.patrolTaskListMessage.id)
        }
      }
	});
    next() 
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","enterProblemRecordMessage","patrolTaskListMessage","taskOrderType"])
  },

  methods: {
    ...mapMutations(["changeEnterProblemRecordMessage","changeTaskOrderType"]),

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

    // tab切换值变化事件
    vanTabsChangeEvent (value) {
        if (value == 'currentTask') {
            this.queryCurrentTaskProblemWorkerOrder(this.patrolTaskListMessage.id)
        } else {
            this.queryAllTaskProblemWorkerOrder({
                proId: this.userInfo.hospitalList[0]['hospitalId'], // 项目id
		        workerId: this.userInfo.id
            })
        }
    },

    // 获取当前任务问题工单列表
    queryCurrentTaskProblemWorkerOrder (taskId) {
        this.loadingShow = true;
        this.overlayShow = true;
        this.currentTaskOrderEmptyShow = false;
		getCurrentTaskProblemWorkerOrder(taskId).then((res) => {
            this.loadingShow = false;
            this.overlayShow = false;
        if (res && res.data.code == 200) {
           if (res.data.data.length > 0) {
               this.currentTaskProblemOrderList = res.data.data
           } else {
                this.currentTaskOrderEmptyShow = true
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

    // 获取所有任务问题工单列表
    queryAllTaskProblemWorkerOrder (data) {
        this.loadingShow = true;
        this.overlayShow = true;
        this.allTaskOrderEmptyShow = false;
		getAllTaskProblemWorkerOrder(data).then((res) => {
            this.loadingShow = false;
            this.overlayShow = false;
        if (res && res.data.code == 200) {
           if (res.data.data.length > 0) {
               this.allTaskProblemOrderList = res.data.data
           } else {
            this.allTaskOrderEmptyShow = true
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


    // 点击进入问题记录页
    problemRecordEvent (item) {
        let temporaryInfo = this.enterProblemRecordMessage;
        temporaryInfo['isAllowOperation'] = false;
        temporaryInfo['orderMessage'] = item;
        temporaryInfo['enterProblemRecordPageSource'] = '/questionList';
        this.changeEnterProblemRecordMessage(temporaryInfo);
        // 保存切换类型
        let temporaryMessage = this.taskOrderType;
        temporaryMessage['taskTypeName'] = this.activeName;
        this.changeTaskOrderType(temporaryMessage);
        this.$router.push('/problemRecord')
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
        .van-nav-bar__left {
        .van-nav-bar__text {
            color: #fff !important;
            margin-left: 8px !important;
        }
        }
        .van-icon {
        color: #fff !important;
        font-size: 22px !important;
        }
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
                            .inspect-item {
                                color: #1684FC
                            };
                            .complete-patrol-area {
                                >span {
                                }
                            };
                            .unfinished-patrol-area {
                                >span {
                                }
                            }
                        }
                    }
                }    
            }
        }
    }
  }
}
</style>