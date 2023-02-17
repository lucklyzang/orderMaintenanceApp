<template>
  <div class="page-box" ref="wrapper">
     <!-- 交接时间 -->
    <div class="find-time-box">
      <van-popup v-model="showHandoverTime" position="bottom">
        <van-datetime-picker
          v-model="handoverTime"
          type="datetime"
          :min-date="minDate"
          :max-date="maxDate"
        >
          <template #default>
            <h3>交接时间</h3>
            <van-icon name="cross" size="25" @click="showHandoverTime = false" />
          </template>
          <template #columns-bottom>
            <div class="button-box">
              <span @click="showHandoverTime = false">取消</span>
              <span @click="handoverFirm">确认</span>
            </div>
          </template>
        </van-datetime-picker>
      </van-popup>
    </div>
    <!-- 联系时间 -->
    <div class="find-time-box">
      <van-popup v-model="showRelationTime" position="bottom">
        <van-datetime-picker
          v-model="relationTime"
          type="datetime"
          :min-date="minDate"
          :max-date="maxDate"
        >
          <template #default>
            <h3>联系时间</h3>
            <van-icon name="cross" size="25" @click="showRelationTime = false" />
          </template>
          <template #columns-bottom>
            <div class="button-box">
              <span @click="showRelationTime = false">取消</span>
              <span @click="relationFirm">确认</span>
            </div>
          </template>
        </van-datetime-picker>
      </van-popup>
    </div>
    <!-- 领取时间 -->
    <div class="find-time-box">
      <van-popup v-model="showGetTime" position="bottom">
        <van-datetime-picker
          v-model="getTime"
          type="datetime"
          :min-date="minDate"
          :max-date="maxDate"
        >
          <template #default>
            <h3>领取时间</h3>
            <van-icon name="cross" size="25" @click="showGetTime = false" />
          </template>
          <template #columns-bottom>
            <div class="button-box">
              <span @click="showGetTime = false">取消</span>
              <span @click="getTimeFirm">确认</span>
            </div>
          </template>
        </van-datetime-picker>
      </van-popup>
    </div>
    <div class="img-dislog-box">
        <van-dialog v-model="imgBoxShow" width="98%" :close-on-click-overlay="true" confirm-button-text="关闭">
            <img :src="currentImgUrl" />
        </van-dialog> 
    </div>  
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{loadingText}}</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <div class="nav">
       <van-nav-bar
        title="事件详情"
        left-text="返回"
        right-text="更多信息"
        :left-arrow="true"
        :placeholder="true"
        :border="false"
        :fixed="true"
        z-index="1000"
        :safe-area-inset-top="true"
        @click-left="onClickLeft"
        @click-right="onClickRight"
    >
    </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
      <div class="content-box">
        <div class="step-box">
          <div v-for="(item,index) in stepData" :key="index">
            <span>{{ item.stepName }}</span>
            <img :src="stepStaticPng" alt="" v-show="index != 3">
          </div>
        </div>
        <div class="message-box-one" v-if="currentStepIndex == 0">
         <div class="select-box-one">
            <div class="select-box-left">
              <span>事件类型</span>
            </div>
            <div class="select-box-right">
              <span>{{ eventType }}</span>
            </div>
          </div>
          <div class="select-box-one">
            <div class="select-box-left">
              <span>建筑</span>
            </div>
            <div class="select-box-right">
              <span>{{ currentStructure }}</span>
            </div>
          </div>
          <div class="select-box-one">
            <div class="select-box-left">
              <span>区域</span>
            </div>
            <div class="select-box-right">
              <span>{{ currentGoalDepartment }}</span>
            </div>
          </div>
          <div class="select-box-one">
            <div class="select-box-left">
              <span>房间</span>
            </div>
            <div class="select-box-right">
              <span>{{ disposeTaskPresent(currentGoalSpaces) }}</span>
            </div>
          </div>
          <div class="select-box-one">
            <div class="select-box-left">
              <span>拾得地点</span>
            </div>
            <div class="select-box-right">
              <span>{{ detailsSite }}</span>
            </div>
          </div>
          <div class="select-box-one">
            <div class="select-box-left">
              <span>拾得时间</span>
            </div>
            <div class="select-box-right">
              <span>{{ getNowFormatDate(currentFindTime) }}</span>
            </div>
          </div>
          <div class="transport-type">
            <div class="transport-type-left">
              <span>拾得内容</span>
            </div>
            <div class="transport-type-right">
             {{ taskDescribe }}
            </div>
          </div>
          <div class="result-picture">
                <div>
                    <span>现场拍照</span>
                </div>
                <div class="image-list">
                    <div v-for="(item, index) in problemPicturesList" :key='index'>
                        <img :src="item" @click="enlareEvent(item)" />
                    </div>
                </div>
          </div>
        </div>
        <div class="message-box" v-if="currentStepIndex == 1">
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>交接时间</span>
            </div>
            <div class="select-box-right" @click="showHandoverTime = true">
              <span>{{ getNowFormatDate(handoverTime) }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="details-site problem-overview">
            <div class="transport-type-left">
              <span>*</span>
              <span>交接地点</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="connectSite"
                rows="1"
                autosize
                type="textarea"
                placeholder="请输入"
              />
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-left">
              <span>*</span>
              <span>交接人签字</span>
            </div>
            <div class="signature-right">
              <span>请签字</span>
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-left">
              <span>*</span>
              <span>保管人签字</span>
            </div>
            <div class="signature-right">
              <span>请签字</span>
            </div>
          </div>
        </div>
        <div class="message-box" v-if="currentStepIndex == 2">
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>联系时间</span>
            </div>
            <div class="select-box-right" @click="showRelationTime = true">
              <span>{{ getNowFormatDate(relationTime) }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="details-site problem-overview">
            <div class="transport-type-left">
              <span>*</span>
              <span>联系部门</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="contactDepartment"
                rows="1"
                autosize
                type="textarea"
                placeholder="请输入"
              />
            </div>
          </div>
          <div class="details-site problem-overview">
            <div class="transport-type-left">
              <span>*</span>
              <span>联系人</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="linkman"
                rows="1"
                autosize
                type="textarea"
                placeholder="请输入"
              />
            </div>
          </div>
          <div class="transport-type">
            <div class="transport-type-left">
              <span>*</span>
              <span>联系情况</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="contactInformation"
                rows="3"
                autosize
                type="textarea"
                placeholder="可联系失主,告知联系电话"
              />
            </div>
          </div>
        </div>
        <div class="message-box" v-if="currentStepIndex == 3">
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>领取时间</span>
            </div>
            <div class="select-box-right" @click="showGetTime = true">
              <span>{{ getNowFormatDate(getTime) }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="details-site problem-overview">
            <div class="transport-type-left">
              <span>*</span>
              <span>领取地点</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="getSite"
                rows="1"
                autosize
                type="textarea"
                placeholder="请输入"
              />
            </div>
          </div>
          <div class="linkman-message-box" v-for="(item,index) in getMessage" :key="index">
            <div class="details-site problem-overview">
              <div class="transport-type-left">
                <span>*</span>
                <span>联系人</span>
              </div>
              <div class="transport-type-right">
                <van-field
                  v-model="item.finalLinkman"
                  rows="1"
                  autosize
                  type="textarea"
                  placeholder="请输入"
                />
              </div>
            </div>
            <div class="details-site problem-overview">
              <div class="transport-type-left">
                <span>*</span>
                <span>领取人身份证号</span>
              </div>
              <div class="transport-type-right">
                <van-field
                  v-model="item.getPersonIdNumber"
                  rows="1"
                  autosize
                  type="textarea"
                  placeholder="请输入"
                />
              </div>
            </div>
            <div class="transport-type get-content-describe">
              <div class="transport-type-left">
                <span>领取内容描述</span>
              </div>
              <div class="transport-type-right">
                <van-field
                  v-model="item.getContentDescribe"
                  rows="3"
                  autosize
                  type="textarea"
                  placeholder="可联系失主,告知联系电话"
                />
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-left">
                <span>*</span>
                <span>领取人签字</span>
              </div>
              <div class="signature-right">
                <span>请签字</span>
              </div>
            </div>
            <img :src="addIconPng" alt="" @click="addLinkmanMessage" v-if="index == 0">
            <img :src="subtractIconPng" alt="" @click="subtractLinkmanMessage(index)" v-if="index != 0">
          </div>
        </div>
        <div class="btn-box" v-if="currentStepIndex==0">
          <span class="operate-two" @click="closeEvent">关闭</span>
          <span class="operate-three" @click="delelteEvent">
            <van-icon name="delete" color="#fff" size="25" />
          </span>
        </div>
        <div class="btn-box-other" v-else>
          <span class="operate-one" @click="delelteEvent">
            <van-icon name="delete" color="#fff" size="25" />
          </span>
         <span class="operate-two">
            暂存
          </span>
          <span class="operate-three">
            保存
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { eventDelete } from '@/api/escortManagement.js'
import _ from 'lodash'
import ScrollSelection from "@/components/ScrollSelection";
import BottomSelect from "@/components/BottomSelect";
export default {
  name: "HistoryClaimRegister",
  components: {
    ScrollSelection,
    BottomSelect
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      currentStepIndex: 3,
      loadingShow: false,
      eventType: '拾金不昧',
      problemPicturesList: [require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png")],
      currentImgUrl: '',
      photoBox: false,
      imgBoxShow: false,
      minDate: new Date(2010, 0, 1),
      maxDate: new Date(2050, 10, 1),
      imgIndex: '',
      loadingText: '加载中...',
      detailsSite: '',
      taskDescribe: '飒飒水水水水水水水水水水水水',
      transportNumberValue: '',
      currentFindTime: new Date(),
      showHandoverTime: false,
      handoverTime: new Date(),
      connectSite: '',
      connectSignature: '',
      keeperSignature: '',
      
      showRelationTime: false,
      relationTime: new Date(),
      contactDepartment: '',
      linkman: '',
      contactInformation: '',

      showGetTime: false,
      getTime: new Date(),
      getSite: '',
      getMessage: [
        {
          finalLinkman: '',
          getPersonIdNumber: '',
          getContentDescribe: '',
          getPersonSignature: ''
        }
      ],


      goalDepartmentOption: [],
      currentGoalDepartment: '',

      goalSpacesOption: [],
      currentGoalSpaces: [],


      structureOption: [],
      currentStructure: '',
      overlayShow: false,
      stepData: [
        {
          stepName: '登记'
        },
        {
          stepName: '交接'
        },
        {
          stepName: '联系'
        },
        {
          stepName: '领取'
        }
      ],
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      stepStaticPng: require("@/common/images/home/step-static.png"),
      stepActivePng: require("@/common/images/home/step-active.png"),
      addIconPng: require("@/common/images/home/add-icon.png"),
      subtractIconPng: require("@/common/images/home/subtract-icon.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        that.$router.push({path: '/eventList'})
      })
    }
  },

  watch: {
  },

  computed: {
    ...mapGetters(["userInfo","transportantTaskMessage","temporaryStorageRepairsRegisterMessage"]),
    proId () {
      return this.userInfo.extendData.proId
    },
    userName () {
      return this.userInfo.userName
    },
    proName () {
      return this.userInfo.extendData.proName
    },
    workerId () {
      return this.userInfo.extendData.userId
    }
  },

  methods: {
    ...mapMutations(["changeCatchComponent","changeOverDueWay","changetransportTypeMessage","changeTemporaryStorageRepairsRegisterMessage"]),

    onClickLeft() {
      this.$router.push({ path: "/eventList"})
    },

    onClickRight() {
      this.$router.push({ path: "/moreHistoryClaimRegister"})
    },


    // 图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 交接时间弹框确认事件
    handoverFirm() {
      this.showHandoverTime = false
    },

    // 联系时间弹框确定事件
    relationFirm () {
      this.showRelationTime = false
    },

    // 领取时间弹框确定事件
    getTimeFirm () {
      this.showGetTime = false
    },

    // 领取步骤添加联系人
    addLinkmanMessage () {
      this.getMessage.push({
        finalLinkman: '',
        getPersonIdNumber: '',
        getContentDescribe: '',
        getPersonSignature: ''
      })
    },

    // 领取步骤删除联系人
    subtractLinkmanMessage (index) {
      this.getMessage.splice(index,1)
    },



    // 处理维修任务参与者
    disposeTaskPresent (item) {
      if (item.length == 0) { return '请选择'};
      let temporaryArray = [];
      for (let innerItem of item) {
        temporaryArray.push(innerItem.text)
      };
      return temporaryArray.join('、')
    },

    // 格式化时间
    getNowFormatDate(currentDate) {
      let currentdate;
      let strDate = currentDate.getDate();
      let seperator1 = "-";
      let seperator2 = ":";
      let month = currentDate.getMonth() + 1;
      let hour = currentDate.getHours();
      let minutes = currentDate.getMinutes();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      };
      if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
      };
      if (minutes >= 0 && minutes <= 9) {
        minutes = "0" + minutes;
      };
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      };
      currentdate = currentDate.getFullYear() + seperator1 + month + seperator1 + strDate + ' ' + hour + seperator2 + minutes
      return currentdate
    },

    // 关闭事件
    closeEvent () {
      this.$router.push({ path: "/eventList"})
    },

    // 删除事件
    delelteEvent (id) {
      this.loadingText = '删除中...';
      this.loadingShow = true;
      this.overlayShow = true;
      eventDelete(id).then((res) => {
        if (res && res.data.code == 200) {
          this.$toast(`${res.data.msg}`);
          this.$router.push({path:'/eventList'});
        } else {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true
          }).then(() => {
          });
        };
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false
      })
      .catch((err) => {
        this.$dialog.alert({
          message: `${err.message}`,
          closeOnPopstate: true
        }).then(() => {
        });
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false
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
  .content-wrapper();
   .find-time-box {
    /deep/ .van-popup {
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      .van-picker {
        padding: 20px 10px;
        box-sizing: border-box;
        .van-picker__toolbar {
          h3 {
            display: flex;
            justify-content: space-around;
            font-size: 18px;
            width: 100%;
            line-height: 40px;
            color: #101010;
            height: 40px;
            position: relative;
            /deep/ .van-icon {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              right: 0
            }
          }
        };
        .button-box {
          height: 60px;
          display: flex;
          width: 100%;
          margin: 0 auto;
          align-items: center;
          justify-content: center;
          >span {
              width: 40%;
              display: inline-block;
              height: 45px;
              font-size: 18px;
              line-height: 45px;
              background: #fff;
              text-align: center;
              border-radius: 30px;
              &:nth-child(1) {
                  color: #1864FF;
                  box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
                  margin-right: 40px
              };
              &:last-child {
                  color: #fff;
                  background: linear-gradient(to right, #6cd2f8, #2390fe);
                  box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
              }
          }
        }
      }
    }
  };
  .img-dislog-box {
    .van-dialog {
        .van-dialog__content {
            >img {
                width: 100%
            }
        }
    }
  };
  /deep/ .van-popup--right {
    padding: 20px 0 80px 0;
    box-sizing: border-box;
    .top-icon {
        padding-left: 10px;
        box-sizing: border-box
    };
    .center-content {
        margin-top: 20px;
        .function-list {
            width: 153px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            margin: 0 auto;
            border: 1px solid #3B9DF9;
            box-sizing: border-box;
            font-size: 16px;
            color: #3B9DF9;
            border-radius: 8px;
            margin-bottom: 20px
        };
        .functionListStyle {
            color: #fff !important;
            border: none !important;
            background: #3B9DF9 !important
        }
    };
    .signout-box {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        width: 153px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #E86F50;
        font-size: 16px;
        color: #fff;
        border-radius: 8px
    }
  };
  .nav {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 10;
    left: 0;
    /deep/ .van-nav-bar {
        background: transparent;
        .van-nav-bar__left {
            .van-nav-bar__text {
                color: #fff !important;
                margin-left: 8px !important;
            }
        };
        .van-nav-bar__right {
            .van-nav-bar__text {
                color: #fff
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
    height: 0;
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
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 0;
        background: #f7f7f7;
        z-index: 10;
        .step-box {
          width: 100%;
          height: 46px;
          background: #fff;
          box-shadow: 0px 1px 3px 0px rgba(47, 132, 211, 0.49);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          > div {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            &:last-child {
              width: 90px !important;
              flex: 0 !important
            };
            span {
              display: inline-block;
              font-size: 14px;
              margin-right: 14px;
              width: 48px;
              text-align: center;
              height: 46px;
              line-height: 46px;
              color: #8E9397
            };
            .currentSpanStyle {
              color: #289E8E;
              font-size: 16px;
              font-weight: bold;
              .bottom-border-1px(#3B9DF9,6px)
            };
            .spanStyle {
              color: #289E8E;
              font-size: 14px;
              border-bottom: none
            }
            img {
              width: 24px;
              height: 24px
            }
          }
        };
        .message-box-one {
          flex: 1;
          width: 100%;
          overflow: scroll;
          .select-box-one {
            width: 100%;
            padding: 10px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 2px;
            .select-box-left {
              padding-right: 10px;
              box-sizing: border-box;
              >span {
                &:nth-child(1) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                }
              }
            };
            .select-box-right {
              flex: 1;
              justify-content: flex-end;
              align-items: center;
              display: flex;
              width: 0;
              >span {
                color: #101010;
                text-align: right;
                flex: 1;
                .no-wrap()
              }
            }
          };
          .transport-type {
            width: 100%;
            padding: 10px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 2px;
            .transport-type-left {
              width: 100%;
              margin-bottom: 10px;
              >span {
                &:nth-child(1) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                };
              }
            };
            .transport-type-right {
              width: 100%;
              word-break: break-all;
              line-height: 20px
            }
          };
          .result-picture {
            padding: 14px 8px;
            margin-top: 2px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            background: #fff;
            justify-content: space-between;
            >div {
                font-size: 14px;
                color: #101010;
                &:first-child {
                   width: 100%;
                   margin-bottom: 10px;
                    >span {
                       color: #9E9E9A
                    }
                };
                &:nth-child(2) {
                    width: 100%;
                    flex-wrap: wrap;
                    display: flex;
                    >div {
                        width: 23.5%;
                        height: 70px;
                        vertical-align: top;
                        margin-right: 2%;
                        margin-top: 2%;
                        position: relative;
                        &:nth-child(1) {
                            margin-top: 0;
                        };
                        &:nth-child(2) {
                            margin-top: 0;
                        };
                        &:nth-child(3) {
                            margin-top: 0;
                        };
                        &:nth-child(4) {
                            margin-top: 0;
                        };
                        &:nth-child(4n+4) {
                            margin-right: 0;
                        };
                        img {
                            width: 100%;
                            height: 100%
                        }
                    }
                }
            }  
          }
        };
         .message-box {
          flex: 1;
          width: 100%;
          overflow: scroll;
          .event-type {
            .select-box-left {
              padding-right: 10px;
              box-sizing: border-box;
              >span {
                &:nth-child(1) {
                  color: red
                };
                &:nth-child(2) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                }
              }
            }
          };
          .select-box {
            width: 100%;
            padding: 8px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 6px;
            .select-box-left {
              padding-right: 10px;
              box-sizing: border-box;
              >span {
                &:nth-child(1) {
                  color: red
                };
                &:nth-child(2) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                }
              }
            };
            .select-box-right {
              flex: 1;
              justify-content: flex-end;
              align-items: center;
              display: flex;
              padding-right: 20px;
              box-sizing: border-box;
              width: 0;
              >span {
                color: #101010;
                text-align: right;
                flex: 1;
                .no-wrap()
              }
            }
          };
          .signature-box {
            width: 100%;
            padding: 8px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 6px;
            .signature-left {
              padding-right: 10px;
              box-sizing: border-box;
              >span {
                &:nth-child(1) {
                  color: red
                };
                &:nth-child(2) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                }
              }
            };
            .signature-right {
              display: flex;
              width: 110px;
              height: 41px;
              background: #F9F9F9;
              align-items: center;
              justify-content: center;
              span {
                font-size: 14px;
                color: #BBBBBB
              };
              img {
                width: 63px;
                height: 30px
              }
            }
          };
          .linkman-message-box {
            padding: 4px 40px 4px 0;
            box-sizing: border-box;
            margin-top: 6px;
            position: relative;
            background: #fff;
            >img {
              width: 24px;
              position: absolute;
              height: 24px;
              right: 8px;
              top: 50%;
              transform: translateY(-50%)
            };
            .details-site {
              .transport-type-left {
                width: auto !important
              }
            };
            .get-content-describe{
              .transport-type-left {
                >span {
                  color: #9E9E9A !important;
                  padding-left: 10px;
                  box-sizing: border-box
                }
              };
              .transport-type-right {
                padding-left: 10px;
                box-sizing: border-box
              }
            }
          };
          .end-select-box {
              .select-box-right {
                padding-right: 0 !important
              }
          };
          .problem-overview {
            align-items: center
          };
          .details-site {
            width: 100%;
            padding: 8px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 6px;
            .transport-type-left {
              width: 25%;
              padding-right: 5px;
              box-sizing: border-box;
              >span {
                &:nth-child(1) {
                  color: red
                };
                &:nth-child(2) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                };
              }
            };
            .transport-type-right {
              width: 0;
              flex: 1;
              display: flex;
              flex-wrap: wrap;
              /deep/ .van-cell {
                padding: 4px 6px !important;
                background: #F9F9F9
              }
            }
          };
          .transport-type {
            width: 100%;
            padding: 10px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 6px;
            .transport-type-left {
              width: 100%;
              margin-bottom: 12px;
              >span {
                &:nth-child(1) {
                  color: red
                };
                &:nth-child(2) {
                  color: #9E9E9A;
                  padding-right: 6px;
                  box-sizing: border-box
                };
              }
            };
            .transport-type-right {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              /deep/ .van-cell {
                padding: 4px 6px !important;
                background: #F9F9F9
              }
            }
          };
          .result-picture {
            padding: 14px 8px;
            margin-top: 6px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            background: #fff;
            justify-content: space-between;
            >div {
                font-size: 14px;
                color: #101010;
                &:first-child {
                   width: 100%;
                   margin-bottom: 8px;
                    >span {
                        &:nth-child(1) {
                        color: red
                        };
                        &:nth-child(2) {
                        color: #9E9E9A;
                        padding-right: 6px;
                        box-sizing: border-box
                        }
                    }
                };
                &:nth-child(2) {
                    width: 100%;
                    flex-wrap: wrap;
                    display: flex;
                    >div {
                        width: 23.5%;
                        height: 70px;
                        vertical-align: top;
                        margin-right: 2%;
                        margin-top: 2%;
                        position: relative;
                        &:nth-child(1) {
                            margin-top: 0;
                        };
                        &:nth-child(2) {
                            margin-top: 0;
                        };
                        &:nth-child(3) {
                            margin-top: 0;
                        };
                        &:nth-child(4) {
                            margin-top: 0;
                        };
                        &:nth-child(4n+4) {
                            margin-right: 0;
                        };
                        .icon-box {
                            position: absolute;
                            bottom: 0;
                            right: 0;
                            display: flex;
                            width: 100%;
                            padding: 2px 0;
                            box-sizing: border-box;
                            justify-content: center;
                            align-items: center;
                            background: #616161;
                            /deep/ .van-icon {
                            }  
                        };
                        img {
                            width: 100%;
                            height: 100%
                        };
                        &:last-child {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background: #f2f2f2;
                            /deep/ .van-icon{
                                position: relative;
                                top: 0;
                                right: 0;
                            }
                        }
                    }
                }
            }  
          }
        };
        .btn-box {
          width: 90%;
          margin: 0 auto;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          >span {
            width: 30%;
            display: inline-block;
            height: 45px;
            font-size: 18px;
            line-height: 45px;
            background: #fff;
            text-align: center;
            border-radius: 30px;
            &:nth-child(1) {
              color: #E86F50;
              border: 1px solid #E86F50;
              margin-right: 30px
            };
            &:nth-child(2) {
              background: #E86F50;
              display: flex;
              justify-content: center;
              align-items: center
            }
          }
        };
        .btn-box-other {
          width: 95%;
          margin: 0 auto;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          >span {
            width: 30%;
            display: inline-block;
            height: 45px;
            font-size: 18px;
            line-height: 45px;
            background: #fff;
            text-align: center;
            border-radius: 30px;
            &:nth-child(1) {
              background: #E86F50;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-right: 20px
            };
            &:nth-child(2) {
              color: #3B9DF9;
              border: 1px solid #3B9DF9;
              margin-right: 20px
            };
            &:last-child {
              width: 35%;
              color: #fff;
              background: linear-gradient(to right, #6cd2f8, #2390fe);
              box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            }
          }
        }
    }
  }
}
</style>