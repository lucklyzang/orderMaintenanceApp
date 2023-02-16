<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
        <van-nav-bar title="巡更项详情" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
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
    <!-- 事件类型选择弹窗 -->
    <div class="event-type-box">
      <van-dialog v-model="eventTypeShow" width="100%"
        confirm-button-color="#2390fe"
      >
        <div class="dialog-top">
          <div class="select-title">请选择事件类型</div>
          <van-icon name="cross" size="24" @click="eventTypeShow = false" />
        </div>
        <div class="inspection-item">
          <span>巡查项:</span>
          <span>设施是否安全可用</span>
        </div>
        <div class="dialog-center">
          <p v-for="(item,index) in eventTypeList" :key="index" @click="eventTypeClickEvent(item)">
            {{ item }}
          </p>
        </div>
      </van-dialog>
    </div>
    <!-- 退出提示框   -->
    <div class="quit-info-box">
       <van-dialog v-model="quitInfoShow"  show-cancel-button width="85%"
          @confirm="quitSure" @cancel="quitCancel" confirm-button-text="是"
          cancel-button-text="否"
        >
          <div class="delete-icon">
            <van-icon name="cross" size="24" @click="quitInfoShow = false" />
          </div>
          <div class="dialog-title">
            该区域还未巡更完毕,是否要退出?
          </div>
          <div class="dialog-center">
            退出后您还可以再次进入该地点继续进行巡更，本次巡查登记的事件和勾选的巡查项将被保留，但未将巡查项全部勾选之前您将无法完成该巡查任务 
          </div>
      </van-dialog>
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
      eventTypeShow: false,
      quitInfoShow: false,
      radioValue: 1,
      loadingShow: false,
      eventTypeList: ['工程报修','拾金不昧','其它'],
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

    // 确定退出
    quitSure () {
      this.$router.push({path: '/workOrderDetails'})
    },

    // 取消退出
    quitCancel () {

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
      // 该巡查项下面有登记事件该巡查项无法再由X改为√。如果把登记的事件全部删除了，那就可以由X改为√。
      if (item['isHaveEventRegister'] == 1) {
        this.$toast({
          type: 'fail',
          message: '该巡查项下面有登记事件,把该巡查项下登记的事件全部删除后,方能通过'
        });
        return
      };
      checkItemPass({resultId:item.resultId,workerName: this.userInfo.name}).then((res) => {
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
      // 已完成的任务
      if (this.patrolTaskListMessage.state == 4) {
        // 该检查项最终结果选为×,点击后直接进入异常检查项事件列表页
        if (this.departmentCheckList['checkItemList'][index]['checkResult'] == 3) {
          //保存进入问题记录页的相关信息
          let temporaryInfo = this.enterProblemRecordMessage;
          temporaryInfo['isAllowOperation'] = true;
          temporaryInfo['enterProblemRecordPageSource'] = '/areaPatrolDetails';
          temporaryInfo['issueInfo'] = item;
          temporaryInfo['index'] = index; 
          this.changeEnterProblemRecordMessage(temporaryInfo);
          this.$router.push({path: '/problemRecord'})
        } else {
          // 该检查项最终结果选为√,点击后不做处理
          return
        }
      } else {
        // 未完成的任务
        this.loadingShow = true;
        this.overlayShow = true;
        this.loadText = '提交中';
        checkItemNoPass({resultId:item.resultId,workerName: this.userInfo.name}).then((res) => {
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
            // 第一次点击X，直接选择事件类型进行登记
            if (this.departmentCheckList['checkItemList'][index]['checkResult'] == 0 || this.departmentCheckList['checkItemList'][index]['checkResult'] == 1) {
              this.eventTypeShow = true
            } else {
              // 第二次及以上再点击X，进入异常巡查项事件列表页
              this.$router.push({path: '/problemRecord'})
            };
            // 更改该检查项选中状态
            let tempraryMessage = deepClone(this.departmentCheckList);
            tempraryMessage['checkItemList'][index]['checkResult'] = '3';
            this.changeDepartmentCheckList(tempraryMessage)
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
    },

    // 确认事件
    sureEvent () {
      if (this.departmentCheckList.checkItemList.some((item) => { return item.checkResult == 0})) {
      this.quitInfoShow = true;
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
        .inspection-item {
          text-align: center;
          padding: 10px 0;
          box-sizing: border-box;
          >span {
            font-size: 14px;
            color: #3B9DF9
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
  };
  .quit-info-box {
    /deep/ .van-dialog {
      .van-dialog__content {
          padding: 20px 16px 0 16px !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          .delete-icon {
            text-align: right
          };
          .dialog-title {
            padding: 10px 0;
            box-sizing: border-box;
            text-align: center;
            color: #101010;
            font-size: 16px;
          };
          .dialog-center {
            line-height: 20px;
            padding: 20px 0;
            box-sizing: border-box;
            color: #101010;
            font-size: 12px
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