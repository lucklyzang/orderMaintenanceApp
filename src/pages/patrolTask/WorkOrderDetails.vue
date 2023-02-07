<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
        <van-nav-bar title="工单详情" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
            <template #right>
                <van-icon @click="scanQRCodeEvent" name="scan" size="26" color="#fff" />
            </template>
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
                <span>该任务生成时间</span>
                <span>{{ patrolTaskListMessage.createTime }}</span>
            </div>
            <div class="patrol-site">
                <div>巡查地点</div>
                <div class="patrol-site-list-box" v-if="queryDataSuccess">
                    <div class="patrol-site-list" :class="{'patrolSiteListStyle': patrolTaskListMessage.hasArray.indexOf(item.name) > -1 }" v-for="(item,index) in patrolTaskListMessage.needSpaces" :key="index" @click="patrolSiteEvent(item)">
                      {{ item.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="task-operation-box">
      <div class="task-no-complete" :class="{'operationStyle': patrolTaskListMessage.state == 4 }" @click="viewProblemItemsEvent">查看问题项</div>
      <div class="task-complete" v-show="patrolTaskListMessage.state !=4 " @click="completeTaskEvent">完成任务</div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {getTaskDetails, departmentScanCode, departmentScanCodeFinsh} from '@/api/escortManagement.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
export default {
  name: "WorkOrderDetails",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      loadingShow: false,
      queryDataSuccess: false,
      loadText: '加载中',
      statusBackgroundPng: require("@/common/images/home/status-background.png")
    }
  },

  mounted() {
    console.log('大飒飒',this.patrolTaskListMessage);
    // 控制设备物理返回按键
    this.deviceReturn("/patrolTasklist");
    // 获取任务详情
    this.queryTaskDetails();
    // 二维码回调方法绑定到window下面,提供给外部调用
    let me = this;
    window['scanQRcodeCallback'] = (code) => {
      me.scanQRcodeCallback(code);
    };
    window['scanQRcodeCallbackCanceled'] = () => {
      me.scanQRcodeCallbackCanceled();
    }
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","patrolTaskListMessage","departmentCheckList"])
  },

  methods: {
    ...mapMutations(["changeDepartmentCheckList","changePatrolTaskListMessage"]),

    // 顶部导航左边点击事件
    onClickLeft () {
      this.$router.push({path: '/patrolTasklist'})
    },

    // 巡查地点点击事件
    patrolSiteEvent (item) {
      // 未完成扫码校验的科室不允许点击进入
      if (this.patrolTaskListMessage.hasArray.indexOf(item.name) == -1) {
        return
      };
     // 任务已完成
      if (this.patrolTaskListMessage.state == 4) {
        this.codeDepartmentFinsh(item.id,'加载中')
      } else {
        this.codeDepartmentNoFinsh(item.id,'加载中')
      }
    },

    // 查看问题项事件
    viewProblemItemsEvent () {
      this.$router.push({path: '/questionList'})
    },

    // 完成任务事件
    completeTaskEvent () {
      if (this.patrolTaskListMessage['needArray'].length > 0) {
        this.$toast({
          type: 'fail',
          message: '请完成所有巡查区域!'
        });
        return
      };
      this.$router.push({path: '/workOrderElectronicSignature'})
    },

    // 扫码事件
    scanQRCodeEvent () {
      this.scanQRCode()
    },

    // 扫描二维码方法
    scanQRCode () {
      window.android.scanQRcode();
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
          this.queryDataSuccess = true;
          this.changePatrolTaskListMessage(res.data.data)
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

    // 任务未完成扫码
    codeDepartmentNoFinsh (depId,text) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = text;
      departmentScanCode({
        taskId: this.patrolTaskListMessage.id, //当前任务id
        depId, // 当前扫描科室id
        workerId: this.userInfo.id // 当前登陆员工id
      }).then((res) => {
        if (res && res.data.code == 200) {
          this.loadingShow = false;
          this.overlayShow = false;
          let temporaryMessage = this.departmentCheckList;
          temporaryMessage['depId'] = depId;
          temporaryMessage['checkItemList'] = res.data.data;
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

    // 任务完成扫码
    codeDepartmentFinsh (depId,text) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = text;
      departmentScanCodeFinsh({
        taskId: this.patrolTaskListMessage.id, //当前任务id
        depId, // 当前扫描科室id
        workerId: this.userInfo.id // 当前登陆员工id
      }).then((res) => {
        if (res && res.data.code == 200) {
          this.loadingShow = false;
          this.overlayShow = false;
          let temporaryMessage = this.departmentCheckList;
          temporaryMessage['depId'] = depId;
          temporaryMessage['checkItemList'] = res.data.data;
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

    // 扫码科室校验
    codeDepartment (depId) {
      // 任务已完成
      if (this.patrolTaskListMessage.state == 4) {
        this.codeDepartmentFinsh(depId,'校验中')
      } else {
        this.codeDepartmentNoFinsh(depId,'校验中')
      }
    },

    // 摄像头取消扫码后的回调
    scanQRcodeCallbackCanceled () {
    },

    // 摄像头扫码后的回调
    scanQRcodeCallback(code) {
      if (code) {
        let codeData = code.split('|');
        if (codeData.length > 0) {
          this.codeDepartment(codeData[0])
        }
      } else {
        this.$dialog.alert({
          message: '当前没有扫描到任何信息,请重新扫描'
        }).then(() => {
          this.scanQRCodeEvent()
        });
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
            background: #fff;
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
    background: #fff;
    .operationStyle {
      background: linear-gradient(to right, #6cd2f8, #2390fe) !important;
      box-shadow: 0px 2px 6px 0px rgba(36, 149, 213, 1) !important;
      color: #fff !important;
      border: none !important
    };
    >div {
      width: 40%;
      height: 48px;
      font-size: 18px;
      margin-right: 20px;
      line-height: 48px;
      background: #fff;
      text-align: center;
      border-radius: 30px;
      &:first-child {
        color: #1684FC;
        border: 1px solid #1684FC
      };
       &:last-child {
        color: #fff;
        margin-right: 0;
        background: linear-gradient(to right, #6cd2f8, #2390fe);
        box-shadow: 0px 2px 6px 0px rgba(36, 149, 213, 1);
      }
    }
  }
}
</style>