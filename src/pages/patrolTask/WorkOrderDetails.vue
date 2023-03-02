<template>
  <div class="page-box" ref="wrapper">
    <div class="add-message" @click="addMessageEvent" v-show="patrolTaskListMessage.state !=4 ">
      <img :src="addMessagePng" alt="">
    </div>
    <div class="in-positioning" v-show="positioningShow">
      <img :src="positioningPng" alt="">
      <span>定位中</span>
      <span @click="positioningEvent">关闭</span>
    </div>
    <!-- 打卡地点 -->
    <div class="clocking-place-box" v-if="clockingPlaceShow">
      <ScrollSelection :columns="clockingPlaceOption" cancelText="关闭" title="请选择打卡地点" @sure="clockingPlaceSureEvent" @cancel="clockingPlaceCancelEvent" @close="clockingPlaceCloseEvent" />
    </div>
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
      <van-nav-bar title="巡更详情" left-text="返回" left-arrow @click-left="onClickLeft" @click-right="onClickRight" :right-text="patrolTaskListMessage.state !=4 ? '事件登记' : ''" :border="false">
      </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
          <img :src="statusBackgroundPng" />
        </div>
        <div class="content-box">
            <div class="location task-number">
                <span>任务编号</span>
                <span>{{ patrolTaskListMessage.number }}</span>
            </div>
            <div class="location">
                <span>所属任务集名称</span>
                <span>{{ patrolTaskListMessage.configName }}</span>
            </div>
            <div class="location">
                <span>所属任务集生成时间类型</span>
                <span>{{ taskSetTransition(patrolTaskListMessage.type) }}</span>
            </div>
            <div class="location task-create-time">
                <span>预计开始时间</span>
                <span>{{ patrolTaskListMessage.planStartTimeForApp }}</span>
            </div>
            <div class="patrol-site">
                <div>巡更地点</div>
                <div class="patrol-site-list-box" v-if="queryDataSuccess">
                    <div class="patrol-site-list" :class="{'patrolSiteListStyle': patrolTaskListMessage.allCheckItemOkDepArr.indexOf(Number(item.id)) != -1 }" v-for="(item,index) in patrolTaskListMessage.needSpaces" :key="index" @click="patrolSiteEvent(item)">
                      {{ item.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="task-operation-box">
      <div class="task-no-complete"  v-show="patrolTaskListMessage.state !=4 " :class="{'operationStyle': patrolTaskListMessage.state == 4 }" @click="clockInEvent">打卡</div>
      <div class="task-complete" v-show="patrolTaskListMessage.state !=4 " @click="completeTaskEvent">完成任务</div>
    </div>
     <!-- 定位失败提示框 -->
    <div class="location-fail-box">
       <van-dialog v-model="locationFailShow"  show-cancel-button width="90%"
          @confirm="manualClockingWvent" @cancel="againLocationEvent" confirm-button-text="手动打卡"
          cancel-button-text="重新定位"
        >
          <div class="dialog-top">
            <van-icon name="cross" size="24" @click="locationFailShow = false" />
          </div>
          <div class="dialog-center">
           <img :src="exclamationPointPng" alt="">
           <span>定位失败!未找到信标</span>
          </div>
      </van-dialog>
    </div>
    <!-- 手动打卡原因弹窗 -->
    <div class="manual-clocking-reason-box">
      <van-dialog v-model="manualclockingReasonShow" width="100%" show-cancel-button 
        confirm-button-color="#2390fe"
        :before-close="beforeCloseDialogEvent"
        @confirm="manualclockingReasonSure"
        @cancel="manualclockingReasonCancel"
        confirm-button-text="确认"
        cancel-button-text="返回"
      >
        <div class="dialog-top">
          <div class="select-title">请选择手动打卡原因</div>
          <van-icon name="cross" size="24" @click="manualclockingReasonClose" />
        </div>
        <div class="dialog-center">
          <van-radio-group v-model="manualClockingReasonRadio">
            <van-radio :name="item.value" v-for="(item,index) in manualClockingReasonRadioList" :key="index">{{ item.text }}</van-radio>
          </van-radio-group>
        </div>
      </van-dialog>
    </div>

    <!-- 事件类型选择弹窗 -->
    <div class="event-type-box">
      <van-dialog v-model="eventTypeShow" width="100%"
        confirm-button-color="#2390fe"
      >
        <div class="dialog-top">
          <div class="select-title">请选择事件类型</div>
          <van-icon name="cross" size="24" @click="eventTypeShow = false" />
        </div>
        <div class="dialog-center">
          <p v-for="(item,index) in eventTypeList" :key="index" @click="eventTypeClickEvent(item)">
            {{ item }}
          </p>
        </div>
      </van-dialog>
    </div>

  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {getTaskDetails, clockingsSection, departmentClockFinsh} from '@/api/escortManagement.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import ScrollSelection from "@/components/ScrollSelection";
export default {
  name: "WorkOrderDetails",
  components: {
    NavBar,
    ScrollSelection
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      eventTypeShow: false,
      manualClockingReasonRadio: '1',
      manualClockingReasonRadioList:[
        {
          value: '1',
          text: '手机没有信号'
        },
        {
          value: '2',
          text: '手机有信号但打卡失败'
        },
        {
          value: '3',
          text: '其它'
        }
      ],
      manualclockingReasonShow: false,
      locationFailShow: false,
      clockingPlaceShow: false,
      currentClockingPlace: '',
      eventTypeList: ['工程报修','拾金不昧','其它'],
      clockingPlaceOption: [],
      positioningShow: false,
      loadingShow: false,
      queryDataSuccess: false,
      loadText: '加载中',
      positioningPng: require("@/common/images/home/positioning.png"),
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      exclamationPointPng: require("@/common/images/home/exclamation-point.png"),
      addMessagePng: require("@/common/images/home/add-message.png")
    }
  },

  mounted() {
    console.log('大飒飒',this.patrolTaskListMessage);
    // 控制设备物理返回按键
    this.deviceReturn("/patrolTasklist");
    // 获取任务详情
    this.queryTaskDetails()
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","patrolTaskListMessage","departmentCheckList","enterPostMessagePageMessage","enterEventRegisterPageMessage"])
  },

  methods: {
    ...mapMutations(["changeDepartmentCheckList","changePatrolTaskListMessage","changeEnterPostMessagePageMessage","changeEnterEventRegisterPageMessage"]),

    // 顶部导航左边点击事件
    onClickLeft () {
      this.$router.push({path: '/patrolTasklist'})
    },

    // 事件登记事件
    onClickRight () {
      this.eventTypeShow = true
    },

    // 事件类型点击事件
    eventTypeClickEvent (item) {
      // 保存进入事件登记页的相关信息
      let temporaryEnterEventRegisterPageMessage = this.enterEventRegisterPageMessage;
      if ( item == '工程报修') {
        temporaryEnterEventRegisterPageMessage['eventType'] = '工程报修';
        this.$router.push({path: '/repairsRegister'})
      } else if (item == '拾金不昧') {
        temporaryEnterEventRegisterPageMessage['eventType'] = '拾金不昧';
        this.$router.push({path: '/claimRegister'})
      } else if (item == '其他') {
        temporaryEnterEventRegisterPageMessage['eventType'] = '其他';
        this.$router.push({path: '/otherRegister'})
      };
      temporaryEnterEventRegisterPageMessage['registerType'] = '巡查';
      temporaryEnterEventRegisterPageMessage['patrolItemName'] = '';
      temporaryEnterEventRegisterPageMessage['resultId'] = '';
      temporaryEnterEventRegisterPageMessage['depId'] = '';
      temporaryEnterEventRegisterPageMessage['depName'] = '';
      temporaryEnterEventRegisterPageMessage['structId'] = '';
      this.changeEnterEventRegisterPageMessage(temporaryEnterEventRegisterPageMessage)
    },

    // 发布留言事件
    addMessageEvent () {
      let temporaryEnterPostMessagePageMessage = this.enterPostMessagePageMessage;
      temporaryEnterPostMessagePageMessage['storageRadio'] = false;
      temporaryEnterPostMessagePageMessage['collect'] = this.patrolTaskListMessage.configName;
      temporaryEnterPostMessagePageMessage['workers'] = this.patrolTaskListMessage.workers;
      temporaryEnterPostMessagePageMessage['enterPostMessagePageSource'] = '/workOrderDetails';
      this.changeEnterPostMessagePageMessage(temporaryEnterPostMessagePageMessage);
      this.$router.push({path: '/postMessage'})
    },

    // 打卡地点弹框确认事件
    clockingPlaceSureEvent (val) {
      if (val) {
        this.currentClockingPlace =  val
      } else {
        this.currentClockingPlace= '请选择'
      };
      this.clockingPlaceShow = false;
      this.manualclockingReasonShow = true
    },

    // 打卡地点弹框取消事件
    clockingPlaceCancelEvent () {
      this.clockingPlaceShow = false;
      this.locationFailShow = true
    },

    // 打卡地点弹框关闭事件
    clockingPlaceCloseEvent () {
      this.clockingPlaceShow = false
    },

    // 巡查地点点击事件
    patrolSiteEvent (item) {
      // 该任务已完成
      if (this.patrolTaskListMessage.state == 4) {
        this.departmentFinshClock(item.id,'加载中')
      } else {
        // 该科室对应巡查项未全部勾选完毕
        if (this.patrolTaskListMessage.allCheckItemOkDepArr.indexOf(Number(item.id)) == -1) {
          this.$Alert({message:"请先完成巡更!",duration:3000,type:'fail'})
        } else {
          // 该科室对应巡查项全部勾选完毕
          this.departmentFinshClock(item.id,'加载中')
        }
      }   
    },

    // 手动打卡事件
    manualClockingWvent () {
      this.locationFailShow = false;
      this.clockingPlaceShow = true
    },

    // 重新定位事件
    againLocationEvent () {
      this.positioningShow = true;
      this.locationFailShow = false
    },

    // 定位中关闭事件
    positioningEvent () {
      this.positioningShow = false;
      this.overlayShow = false
    },

    // 蓝牙打卡事件
    clockInEvent () {
      if (this.patrolTaskListMessage.state == 4) {
        return
      };
      // this.positioningShow = true;
      // this.overlayShow = true
      // 手动打卡测试
      this.manualClockingWvent()
    },

    // 完成任务事件
    completeTaskEvent () {
      if (this.patrolTaskListMessage['needSpaces'].length != this.patrolTaskListMessage['allCheckItemOkDepArr'].length) {
        this.$Alert({message:"请完成所有巡查项!",duration:3000,type:'fail'})
        return
      };
      this.$router.push({path: '/patrolTaskElectronicSignaturePage'})
    },

    // 获取任务详情
    queryTaskDetails () {
      this.loadingShow = true;
      this.overlayShow = true;
      this.queryDataSuccess = false;
      this.loadText = '加载中';
      getTaskDetails(
        this.patrolTaskListMessage.id
      ).then((res) => {
        if (res && res.data.code == 200) {
          console.log(res.data.data);
          this.loadingShow = false;
          this.overlayShow = false;
          this.loadText = '';
          this.queryDataSuccess = true;
          this.changePatrolTaskListMessage(res.data.data);
          // 选择打卡地点弹框的数据
          this.clockingPlaceOption = [];
          for (let i = 0,len = this.patrolTaskListMessage['needSpaces'].length; i < len; i++) {
            this.clockingPlaceOption.push({
              id: i,
              text: this.patrolTaskListMessage['needSpaces'][i]['name'],
              value: this.patrolTaskListMessage['needSpaces'][i]['id']
            })
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
        this.loadText = '';
        this.$toast({
          type: 'fail',
          message: err
        })
      })
    },

    // 打卡(手动和蓝牙)
    codeDepartmentNoFinsh (depId,text,depName,punchCardType,punchCardReason='') {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = text;
      clockingsSection({
        taskId: this.patrolTaskListMessage.id, //当前任务id
        depId, // 当前扫描科室id
        depName,// 当前扫描科室名称
        workerId: this.userInfo.id, // 当前登陆员工id
        proId: this.userInfo.proIds[0], // 所属项目
        system: 6, // 所属系统
        punchCardReason, //如果是蓝牙连接，可以传空串
        punchCardType //打卡类型(1:蓝牙 2:手动)
      }).then((res) => {
        if (res && res.data.code == 200) {
          console.log('数据',res.data);
          this.loadingShow = false;
          this.overlayShow = false;
          let temporaryMessage = this.departmentCheckList;
          temporaryMessage['depId'] = depId;
          temporaryMessage['checkItemList'] = res.data.data;
          temporaryMessage['punchCardType'] = punchCardType;
          temporaryMessage['punchCardReason'] = punchCardReason;
          temporaryMessage['checkItemList'].forEach(item => {
            item['checkResult'] = item['checkResult'].toString()
          });
          this.changeDepartmentCheckList(temporaryMessage);
          this.$router.push({path: '/areaPatrolDetails'})
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

    // 已打卡成功的科室获取巡查项详情
    departmentFinshClock (depId,text) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = text;
      departmentClockFinsh({
        taskId: this.patrolTaskListMessage.id, //当前任务id
        depId, // 当前扫描科室id
        workerId: this.userInfo.id, // 当前登陆员工id
        proId: this.userInfo.proIds[0], // 所属项目
        system: 6 // 所属系统
      }).then((res) => {
        if (res && res.data.code == 200) {
          console.log(res.data.data);
          this.loadingShow = false;
          this.overlayShow = false;
          this.loadText = '';
          let temporaryMessage = this.departmentCheckList;
          temporaryMessage['depId'] = depId;
          temporaryMessage['punchCardType'] = res.data.data['punchCardType'];
          temporaryMessage['punchCardReason'] = res.data.data['punchCardReason'];
          temporaryMessage['checkItemList'] = res.data.data['itemList'];
          temporaryMessage['checkItemList'].forEach(item => {
            item['checkResult'] = item['checkResult'].toString()
          });
          this.changeDepartmentCheckList(temporaryMessage);
          this.$router.push({path: '/areaPatrolDetails'})
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
        this.loadText = '';
        this.$toast({
          type: 'fail',
          message: err
        })
      })
    },

    // 手动打卡原因弹框关闭前事件
    beforeCloseDialogEvent (action, done) {
      if (action == 'cancel') {
        done()
      } else {
        done()
      }
    },

    // 手动打卡原因弹框确认事件
    manualclockingReasonSure () {
      this.codeDepartmentNoFinsh (this.patrolTaskListMessage.needSpaces.filter((item) => { return item['name'] == this.currentClockingPlace})[0]['id'],'加载中',this.currentClockingPlace,2,this.manualClockingReasonRadioList.filter((item) => { return item.value == this.manualClockingReasonRadio})[0]['text'])
    },

    // 蓝牙连接回调
    bluetoothConnectionCallback () {
      this.codeDepartmentNoFinsh (this.patrolTaskListMessage.needSpacesthis.filter((item) => { return item['name'] == this.currentClockingPlace})[0]['id'],'加载中',this.currentClockingPlace,1)
    },

    // 手动打卡原因弹框关闭事件
    manualclockingReasonClose () {
      this.manualclockingReasonShow = false;
      this.clockingPlaceShow = true
    },

    // 手动打卡原因弹框返回事件
    manualclockingReasonCancel () {
      this.manualclockingReasonShow = false;
      this.clockingPlaceShow = true
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
    }
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  height: 0;
  position: relative;
  .add-message {
    position: fixed;
    z-index: 100;
    bottom: 160px;
    right: 20px;
    width: 80px;
    height: 80px;
    img {
      width: 100%;
      height: 100%
    }
  };
  .in-positioning {
    position: absolute;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    img {
      width: 120px;
      height: 120px
    };
    >span {
      display: inline-block;
      color: #fff;
      &:nth-child(2) {
        font-size: 18px;
        margin: 20px 0
      };
      &:nth-child(3) {
        font-size: 12px
      }
    }
  };
  .location-fail-box {
    /deep/ .van-dialog {
      .van-dialog__content {
          padding: 20px 20px 0 20px !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          .dialog-top {
            text-align: right
          };
          .dialog-center {
            text-align: center;
            line-height: 30px;
            padding: 20px 0;
            box-sizing: border-box;
            font-weight: bold;
            color: #101010;
            font-size: 16px;
            span {
              vertical-align: middle
            };
            img {
              vertical-align: middle;
              width: 24px;
              height: 24px
            }
          }
        };
        .van-dialog__footer {
          padding: 10px 40px 20px 40px !important;
          box-sizing: border-box;
          justify-content: space-between;
          ::after {
            content: none
          };
        .van-dialog__cancel {
            height: 40px;
            background: #3B9DF9;
            color: #fff !important;
            border-radius: 8px;
            margin-right: 20px
        };
        .van-dialog__confirm {
            height: 40px;
            color: #3B9DF9;
            border: 1px solid #3B9DF9;
            border-radius: 8px
        }
        };
        .van-hairline--top::after {
          border-top-width: 0 !important
        }
    }
  };
  .event-type-box {
    /deep/ .van-dialog {
      top: auto !important;
      left: 0 !important;
      border-right: 1px solid #fff;
      bottom: 0 !important;
      border-top-left-radius: 20px !important;
      border-top-right-radius: 20px !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      transform: translate3d(0,0,0) !important;
      .van-dialog__content {
        padding: 0 20px 10px 20px !important;
        box-sizing: border-box;
        height: 50vh;
        .dialog-top {
          height: 60px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          .select-title {
            font-size: 18px;
            color: #101010;
            text-align: center
          };
          /deep/ .van-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 0
          }
        };
        .dialog-center {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding-top: 30px;
          box-sizing: border-box;
          >p {
            width: 121px;
            height: 43px;
            border: 1px solid #3B9DF9;
            border-radius: 10px;
            font-size: 14px;
            color: #3B9DF9;
            text-align: center;
            line-height: 43px;
            margin-bottom: 30px
          }
        }
      };
      .van-dialog__footer {
        display: none
      };
      .van-hairline--top::after {
        border-top-width: 0 !important
      }
    }
  }
  .manual-clocking-reason-box {
    /deep/ .van-dialog {
      top: auto !important;
      left: 0 !important;
      border-right: 1px solid #fff;
      bottom: 0 !important;
      border-top-left-radius: 20px !important;
      border-top-right-radius: 20px !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      transform: translate3d(0,0,0) !important;
      .van-dialog__content {
        padding: 0 20px 10px 20px !important;
        box-sizing: border-box;
        height: 40vh;
        .dialog-top {
          height: 60px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          .select-title {
            font-size: 18px;
            color: #101010;
            text-align: center
          };
          /deep/ .van-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 0
          }
        };
        .dialog-center {
          display: flex;
          justify-content: center;
          .van-radio-group {
            .van-radio {
              margin-top: 40px
            }
          }
        }
      };
      .van-dialog__footer {
          padding: 20px !important;
          box-sizing: border-box;
          justify-content: space-between;
          ::after {
            content: none
          };
        .van-dialog__cancel {
            color: #1864FF;
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            background: #fff;
            border-radius: 30px;
            margin-right: 20px
        };
        .van-dialog__confirm {
            background: linear-gradient(to right, #6cd2f8, #2390fe);
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            color: #fff !important;
            border-radius: 30px;
        }
      };
      .van-hairline--top::after {
        border-top-width: 0 !important
      }
    }
  };
  .content-wrapper();
  /deep/ .van-overlay {
    z-index: 1000 !important
  };
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
        .location {
            padding: 14px 8px;
            box-sizing: border-box;
            display: flex;
            background: #fff;
            justify-content: space-between;
            align-items: center;
            >span {
                font-size: 14px;
                display: inline-block;
                &:first-child {
                    color: #101010
                };
                &:last-child {
                color: #1684FC;
                flex: 1;
                text-align: right;
                line-height: 24px;
                padding-left: 8px;
                box-sizing: border-box;
                word-break: break-all
                }
            }
        };
        .task-number {
            .bottom-border-1px(#BEC7D1)
        };
        .task-create-time {
            margin-bottom: 6px;
        };
        .patrol-site {
            flex: 1;
            padding: 14px 8px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            font-size: 14px;
            color: #101010;
            .patrol-site-list-box {
                display: flex;
                flex-wrap: wrap;
                margin-top: 10px;
                .patrol-site-list {
                    height: 32px;
                    line-height: 32px;
                    border-radius: 4px;
                    text-align: center;
                    padding: 0 6px;
                    color: #fff;
                    box-sizing: border-box;
                    background: #b1b1b1;
                    margin-right: 8px;
                    margin-bottom: 8px
                };
                .patrolSiteListStyle {
                    background: #1684FC
                }
            }
        }
    }    
  };
  .task-operation-box {
    height: 80px;
    display: flex;
    width: 100%;
    z-index: 100;
    align-items: center;
    justify-content: center;
    .operationStyle {
      background: linear-gradient(to right, #6cd2f8, #2390fe) !important;
      box-shadow: 0px 2px 6px 0px rgba(36, 149, 213, 1) !important;
      color: #fff !important;
      border: none !important
    };
    >div {
      width: 45%;
      height: 48px;
      font-size: 18px;
      line-height: 48px;
      background: #fff;
      text-align: center;
      border-radius: 30px;
      &:first-child {
        color: #fff;
        margin-right: 20px;
        background: linear-gradient(to right, #6cd2f8, #2390fe);
        box-shadow: 0px 2px 6px 0px rgba(36, 149, 213, 1)
      };
       &:last-child {
        color: #000000;
        background: #E5E5E5
        
      }
    }
  }
}
</style>