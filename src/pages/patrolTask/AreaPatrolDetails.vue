<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
        <van-nav-bar title="巡查任务" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
        </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
            <img :src="statusBackgroundPng" />
        </div>
        <div class="content-box">
            <div class="current-area">
                <van-icon name="location" color="#1684FC" />
                <span>当前区域: {{ patrolTaskListMessage.needSpaces.filter((item)=> { return item.id == departmentCheckList['depId'] })[0]['name'] }}</span>
            </div>
            <div class="patrol-item-box">
                <div class="patrol-item-list" v-for="(item, index) in checkItemMessage.checkItemList" :key="index">
                    <div class="patrol-item-list-left">
                        <span>{{ index + 1}}</span>
                        <span>{{ item.name }}</span>
                    </div>
                    <div class="patrol-item-list-right">
                        <van-radio-group v-model="item.checkResult" direction="horizontal">
                            <van-radio name="1" @click="(event) => passEvent(event,item,index)">
                                <template #icon="props">
                                    <img class="img-icon" :src="props.checked ? checkCheckboxPng : checkboxPng" />
                                </template>
                            </van-radio>
                            <van-radio name="3" @click="(event) => noPassEvent(event,item,index)">
                                <template #icon="props">
                                    <img class="img-icon" :src="props.checked ? checkCloseCirclePng : closeCirclePng" />
                                </template>
                            </van-radio>
                        </van-radio-group>
                    </div>
                </div>
                <van-empty description="暂无数据" v-show="departmentCheckList.checkItemList.length == 0" />
            </div>
        </div>
    </div>
    <div class="task-operation-box" v-show="departmentCheckList.checkItemList.length > 0 && patrolTaskListMessage.state != 4">
      <div class="task-complete" v-preventReClick="[sureEvent]">确 认</div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import { checkItemPass, checkItemNoPass, submitCheckItem } from '@/api/escortManagement.js'
import { mixinsDeviceReturn } from '@/mixins/deviceReturnFunction'
import { deepClone } from '@/common/js/utils'
export default {
  name: "AreaPatrolDetails",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      radioValue: 1,
      loadingShow: false,
      loadText: '加载中',
      checkItemMessage: "",
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      checkCheckboxPng: require("@/common/images/home/check-checkbox-circle.png"),
      checkboxPng: require("@/common/images/home/checkbox-circle.png"),
      closeCirclePng: require("@/common/images/home/close-circle.png"),
      checkCloseCirclePng: require("@/common/images/home/check-close-circle.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn('/workOrderDetails');
    // 判断该区域是否存在检查项
    if (this.departmentCheckList.checkItemList.length == 0) {
      this.$toast({
        type: 'fail',
        message: '该科室不存在巡查项!'
      });
      setTimeout(() =>{ this.$router.push({path: '/workOrderDetails'}) },2000)
    } else {
      this.checkItemMessage = deepClone(this.departmentCheckList)
    }
  },

  // activated () {
  //   // 控制设备物理返回按键
  //   this.deviceReturn('/workOrderDetails')
  // },

  // beforeRouteEnter(to, from, next) {
  //   next(vm=>{
  //     if (from.path == '/workOrderDetails') {
  //       //此页面进入时重新请求数据
  //       console.log('重新请求数据');
  //     }
	//   });
  //   next() 
  // },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","enterProblemRecordMessage","departmentCheckList","patrolTaskListMessage"]),
  },

  methods: {
    ...mapMutations(["changeEnterProblemRecordMessage","changeDepartmentCheckList"]),

    // 顶部导航左边点击事件
    onClickLeft () {
      this.$router.push({path: '/workOrderDetails'})
    },

    // 通过事件
    passEvent (event,item,index) {
      // 已完成的任务不可操作
      if (this.patrolTaskListMessage.state == 4) {
        return
      };
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '提交中';
      checkItemPass({resultId:item.resultId}).then((res) => {
        if (res && res.data.code == 200) {
          this.loadingShow = false;
          this.overlayShow = false;
          this.$toast({
            type: 'success',
            message: '反馈成功'
          });
          // 更改该检查项选中状态
          let tempraryMessage = deepClone(this.departmentCheckList);
          tempraryMessage['checkItemList'][index]['checkResult'] = '1';
          this.changeDepartmentCheckList(tempraryMessage);
          console.log('飒飒',this.departmentCheckList);
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

    // 不通过事件
    noPassEvent (event,item,index) {
      // 已完成的任务且该检查项最终结果选为×,点击后直接进入检查项详情
      if (this.patrolTaskListMessage.state == 4 && this.departmentCheckList['checkItemList'][index]['checkResult'] == 3) {
        //保存进入问题记录页的相关信息
        let temporaryInfo = this.enterProblemRecordMessage;
        temporaryInfo['isAllowOperation'] = true;
        temporaryInfo['enterProblemRecordPageSource'] = '/areaPatrolDetails';
        temporaryInfo['issueInfo'] = item;
        temporaryInfo['index'] = index; 
        this.changeEnterProblemRecordMessage(temporaryInfo);
        this.$router.push({path: '/problemRecord'})
        return
      };
      if (this.patrolTaskListMessage.state == 4 && this.departmentCheckList['checkItemList'][index]['checkResult'] == 1) {
        return
      };
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '提交中';
      checkItemNoPass({resultId:item.resultId}).then((res) => {
        if (res && res.data.code == 200) {
          this.loadingShow = false;
          this.overlayShow = false;
          this.$toast({
            type: 'success',
            message: '反馈成功'
          });
          //保存进入问题记录页的相关信息
          let temporaryInfo = this.enterProblemRecordMessage;
          temporaryInfo['isAllowOperation'] = true;
          temporaryInfo['enterProblemRecordPageSource'] = '/areaPatrolDetails';
          temporaryInfo['issueInfo'] = item;
          temporaryInfo['id'] = res.data.data ? res.data.data.id : null;
          temporaryInfo['index'] = index; 
          this.changeEnterProblemRecordMessage(temporaryInfo);
          this.$router.push({path: '/problemRecord'})
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

    // 确认事件
    sureEvent () {
      if (this.departmentCheckList.checkItemList.some((item) => { return item.checkResult == 0})) {
        this.$toast({
          type: 'fail',
          message: '请完成所有检查项'
        })
        return
      };
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '提交中';
      submitCheckItem({
        taskId: this.patrolTaskListMessage.id,
        depId: this.departmentCheckList.depId
      }).then((res) => {
        if (res && res.data.code == 200) {
          this.$router.push({path: '/workOrderDetails'});
          this.loadingShow = false;
          this.overlayShow = false;
          this.$toast({
            type: 'success',
            message: '提交成功'
          })
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
        .current-area {
            height: 54px;
            line-height: 54px;
            width: 94%;
            margin: 0 auto;
            font-size: 16px;
            color: #1684FC;
            /deep/ .van-icon {
                vertical-align: middle
            };
            >span {
                vertical-align: middle
            }
        };
        .patrol-item-box {
            flex: 1;
            width: 100%;
            overflow: auto;
            position: relative;
            .van-empty {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%)
            };
            .patrol-item-list {
                padding: 16px 10px;
                box-sizing: border-box;
                background: #fff;
                display: flex;
                justify-content: space-between;
                align-items: center;
                .patrol-item-list-left {
                    font-size: 14px;
                    color: #101010;
                    padding-right: 6px;
                    flex: 1;
                    word-break: break-all;
                    box-sizing: border-box;
                    >span {
                        &:first-child {
                            color: #8E9397;
                            margin-right: 6px;
                        };
                        &:last-child {
                            color: #494D51
                        }
                    }
                };
                .patrol-item-list-right {
                    /deep/ .van-radio-group {
                        .van-radio {
                            .van-radio__icon {
                                height: auto !important
                            };
                            img {
                                width: 30px
                            }
                        };
                        >div {
                            margin-right: 20px;
                            &:last-child {
                                margin-right: 0
                            }
                        }
                    }
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
        margin: 0 auto;
        align-items: center;
        justify-content: center;
        background: #F7F7F7;
        >div {
            width: 80%;
            height: 48px;
            font-size: 18px;
            line-height: 48px;
            background: #fff;
            text-align: center;
            border-radius: 30px;
            font-weight: bold;
            color: #fff;
            background: linear-gradient(to right, #6cd2f8, #2390fe);
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
        }
    }
}
</style>