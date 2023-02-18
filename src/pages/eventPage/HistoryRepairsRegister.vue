<template>
  <div class="page-box" ref="wrapper">
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
        <div class="message-box">
         <div class="select-box">
            <div class="select-box-left">
              <span>事件类型</span>
            </div>
            <div class="select-box-right">
              <span>{{ eventType }}</span>
            </div>
          </div>
          <div class="select-box">
            <div class="select-box-left">
              <span>建筑</span>
            </div>
            <div class="select-box-right">
              <span>{{ currentStructure }}</span>
            </div>
          </div>
          <div class="select-box">
            <div class="select-box-left">
              <span>区域</span>
            </div>
            <div class="select-box-right">
              <span>{{ currentGoalDepartment }}</span>
            </div>
          </div>
          <div class="select-box">
            <div class="select-box-left">
              <span>房间</span>
            </div>
            <div class="select-box-right">
              <span>{{ disposeTaskPresent(currentGoalSpaces) }}</span>
            </div>
          </div>
          <div class="select-box">
            <div class="select-box-left">
              <span>详细地点</span>
            </div>
            <div class="select-box-right">
              <span>{{detailsSite}}</span>
            </div>
          </div>
          <div class="select-box">
            <div class="select-box-left">
              <span>发现时间</span>
            </div>
            <div class="select-box-right">
              <span>{{ currentFindTime }}</span>
            </div>
          </div>
          <div class="select-box">
            <div class="select-box-left">
              <span>任务类型</span>
            </div>
            <div class="select-box-right">
              <span>{{ taskType }}</span>
            </div>
          </div>
          <div class="result-picture">
                <div>
                    <span>问题拍照</span>
                </div>
                <div class="image-list">
                    <div v-for="(item, index) in problemPicturesList" :key='index'>
                        <img :src="item" @click="enlareEvent(item)" />
                    </div>
                </div>
          </div>
          <div class="transport-type">
            <div class="transport-type-left">
              <span>问题描述</span>
            </div>
            <div class="transport-type-right">
             {{ problemOverview }}
            </div>
          </div>
          <div class="transport-type">
            <div class="transport-type-left">
              <span>备注</span>
            </div>
            <div class="transport-type-right">
             {{ taskDescribe }}
            </div>
          </div>
        </div>
        <div class="btn-box">
          <span class="operate-two" @click="closeEvent">关闭</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import _ from 'lodash'
import {getEventDetails} from '@/api/escortManagement.js'
import ScrollSelection from "@/components/ScrollSelection";
import BottomSelect from "@/components/BottomSelect";
export default {
  name: "HistoryRepairsRegister",
  components: {
    ScrollSelection,
    BottomSelect
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      eventType: '拾金不昧',
      problemPicturesList: [require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png")],
      currentImgUrl: '',
      photoBox: false,
      imgBoxShow: false,
      imgIndex: '',
      taskType: '',
      problemOverview: '',
      currentFindTime: '',
      currentStructure: '',
      currentGoalSpaces: '',
      currentGoalDepartment: '',
      detailsSite: '',
      loadingText: '加载中...',
      detailsSite: '',
      taskDescribe: '飒飒水水水水水水水水水水水水',
      overlayShow: false,
      statusBackgroundPng: require("@/common/images/home/status-background.png")
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
    };
    this.queryEventDetails(this.$route.query.eventId)
  },

  watch: {
  },

  computed: {
    ...mapGetters(["userInfo","transportantTaskMessage","temporaryStorageRepairsRegisterMessage"]),
    proId () {
      return this.userInfo.proIds[0]
    },
    userName () {
      return this.userInfo.name
    },
    workerId () {
      return this.userInfo.id
    }
  },

  methods: {
    ...mapMutations(["changeCatchComponent","changeOverDueWay","changetransportTypeMessage","changeTemporaryStorageRepairsRegisterMessage","changeMoreEventMessage"]),

    onClickLeft() {
      this.$router.push({ path: "/eventList"})
    },

    onClickRight() {
      this.$router.push({ path: "/moreHistoryRepairsRegister"})
    },


    // 图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 查询事件详情
    queryEventDetails (id) {
      this.loadingText = '加载中...';
      this.loadingShow = true;
      this.overlayShow = true;
      getEventDetails(id).then((res) => {
        if (res && res.data.code == 200) {
          this.changeMoreEventMessage(res.data.data)
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
        .message-box {
          flex: 1;
          width: 100%;
          overflow: scroll;
          .select-box {
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
         .linkman-message-box {
            padding: 4px 0;
            box-sizing: border-box;
            margin-top: 6px;
            background: #fff;
            .details-site {
                width: 100%;
                padding: 10px 6px;
                box-sizing: border-box;
                background: #fff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
                margin-top: 2px;
                .transport-type-left {
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
                .transport-type-right {
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
          .signature-box {
            width: 100%;
            padding: 8px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 2px;
            .signature-left {
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
            .signature-right {
              display: flex;
              width: 110px;
              height: 41px;
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
        .btn-box {
          width: 90%;
          margin: 0 auto;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          >span {
            width: 80%;
            display: inline-block;
            height: 45px;
            font-size: 18px;
            line-height: 45px;
            text-align: center;
            border-radius: 30px;
            &:nth-child(1) {
              color: #E86F50;
              border: 1px solid #E86F50
            }
          }
        }
    }
  }
}
</style>