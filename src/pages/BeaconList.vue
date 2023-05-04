<template>
  <div class="page-box" ref="wrapper">
    <!-- 清除打卡点提示框   -->
    <div class="quit-info-box">
       <van-dialog v-model="deleteInfoShow"  show-cancel-button width="90%"
          @confirm="deleteSure" @cancel="deleteCancel" confirm-button-text="取消"
          cancel-button-text="确定"
        >
          <div class="dialog-title">
            <van-icon name="cross" size="22" @click="deleteCloseInfoEvent"/>
          </div>
          <div class="dialog-top">
            <img :src="exclamationPointPng">
            <span>删除后无法恢复，请选择是否删除？</span>
          </div>
        </van-dialog>
    </div>
    <!-- 是否成功提示框   -->
    <div class="quit-info-box is-success-info">
       <van-dialog v-model="isShowSuccessShow" width="80%"
          confirm-button-text="确定"
        >
          <div class="dialog-title">
            <van-icon name="cross" size="22" @click="isSuccessInfoEvent"/>
          </div>
          <div class="dialog-top">
            <img :src="isSuccessIcon ?  exclamationPointSuccessPng : exclamationPointPng">
            <span>{{ showIsSuccessText }}</span>
          </div>
        </van-dialog>
    </div>        
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
      <van-nav-bar title="信标列表" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
           <template #right>
                <van-icon name="replay" size="18" color="#fff" />
                <span @click-right="onClickRight">刷新</span>
            </template>
      </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
          <img :src="statusBackgroundPng" />
        </div>
        <div class="content-box">
            <div class="info-box">
                <div class="info-content">当前蓝牙未打开，请打开手机蓝牙后再进行操作</div>
                <div class="info-right" @click="turnNoBluetoothEvent">去打开</div>
            </div>
            <div class="building-box">
                <span>楼栋选择</span>
                <SelectSearch ref="registrantOption" :itemData="buildingOption" :curData="currentBuilding" @change="buildingOptionChange" :isNeedSearch="false" />
            </div>
            <div class="department-list-box" ref="departmentListBox">
                <div class="department-list" v-for="(item,index) in beaconList" :key="index">
                  <div class="list-one-line">
                    <div class="one-line-left">
                      <div class="signal-is-have-box">
                        <img :src="item.beacons.every((currentItem) => { return currentItem.currentSignal == 0}) ? signalNoPng : item.beacons.every((currentItem) => { return currentItem.currentSignal == 1}) ?  signalWeakPng : signalStrongPng " alt="信号标记" />
                        <span :class="{'strongSignal':item.beacons.some((currentItem) => { return currentItem.currentSignal == 2}),'weakSignal':item.beacons.every((currentItem) => { return currentItem.currentSignal == 1})}">{{ item.beacons.every((currentItem) => { return currentItem.currentSignal == 0}) ? '无信号' : item.beacons.every((currentItem) => { return currentItem.currentSignal == 1}) ? '信号弱' : '信号强'}}</span>
                      </div>
                      <div class="department-box">{{ item.departmentName }}</div>
                    </div>
                    <div class="one-line-right" :class="{'oneLineRightStyle':item.isSetClockPoint}">
                      {{ item.isSetClockPoint ? '打卡点已设置':'打卡点未设置'}}
                    </div>
                  </div>
                  <div class="list-two-line">
                    <div class="beacon-list" v-for="(innerItem,innerIndex) in item.beacons" :key="innerIndex">
                      <div class="beacon-left">
                        <span>信标编号:</span>
                        <span>{{ innerItem.beaconNumber }}</span>
                      </div>
                      <div class="beacon-right">
                        <span>当前信号:</span>
                        <span>{{ innerItem.currentSignal == 0 ? "无信号" :  innerItem.currentSignal}}</span>
                        <span>(-25dBm)</span>
                      </div>
                    </div>
                  </div>
                  <div class="list-three-line">
                    <div class="three-line-left">
                      <span :class="{'canTestStyle':item.beacons.some((currentItem) => { return currentItem.currentSignal != 0}) && item.isSetClockPoint}" @click="clockTestEvent(item)">打卡测试</span>
                      <span :class="{'setClockPointStyle':item.isSetClockPoint}" @click="setClockEvent(item)">设置打卡</span>
                      <img :src="questionMarkPng" alt="疑问" @click="questionMarkEvent(item)" class="exclamation-point-png" />
                    </div>
                    <div class="three-line-right" v-show="item.isSetClockPoint">
                      <span @click="clearClockPointEvent">清除打卡点</span>
                    </div>
                  </div>
                  <div class="explain-box" v-show="item.isShowExplain">
                    <div class="explain-title">
                      <img :src="exclamationPointPng" alt="说明" />
                      <span>说明</span>
                    </div>
                    <div class="explain-content">
                      设置该位置为打卡点后，以信标位置为圆心，当前位置到信标位置的距离为半径的球形空间范围内均可打卡（无遮挡的情下）。
                    </div>
                  </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import { } from '@/api/escortManagement.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import SelectSearch from "@/components/SelectSearch";
export default {
  name: "BeaconList",
  components: {
    NavBar,
    SelectSearch
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      deleteInfoShow: false,
      isShowSuccessShow: false,
      showIsSuccessText: '打卡成功！',
      isSuccessIcon: true,
      timeOne: null,
      isLoadDataTime: null,
      loadingShow: false,
      totalCount: '',
      eventTime: 0,
      currentBuilding: null,
      beaconList: [
        {
          departmentName: '儿科',
          isShowExplain: false,
          beacons: [
            {
              beaconNumber: '0001',
              currentSignal: 0,
            },
            {
              beaconNumber: '0002',
              currentSignal: '-11dMb',
            }
          ],
          isSetClockPoint: false
        },
        {
          departmentName: '妇科',
          isShowExplain: false,
          beacons: [
            {
              beaconNumber: '0003',
              currentSignal: 0,
            },
            {
              beaconNumber: '0004',
              currentSignal: '-11dMb',
            }
          ],
          isSetClockPoint: true
        },
        {
          departmentName: '胸科',
          isShowExplain: false,
          beacons: [
            {
              beaconNumber: '0005',
              currentSignal: 0,
            },
            {
              beaconNumber: '0006',
              currentSignal: '-11dMb',
            }
          ],
          isSetClockPoint: false
        }
      ],
      buildingOption: [{text:'请选择',value:null},{text:'住院部',value:1},{text:'急诊楼',value:2}],
      currentPage: 1,
      pageSize: 10,
      loadText: '加载中',
      signalStrongPng: require("@/common/images/home/signal-strong.png"),
      signalWeakPng: require("@/common/images/home/signal-weak.png"),
      signalNoPng: require("@/common/images/home/signal-no.png"),
      questionMarkPng: require("@/common/images/home/question-mark.png"),
      exclamationPointPng: require("@/common/images/home/exclamation-point.png"),
      exclamationPointSuccessPng: require("@/common/images/home/exclamation-point-success.png"),
      statusBackgroundPng: require("@/common/images/home/status-background.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/home");
    this.$nextTick(()=> {
      this.initScrollChange()
    });
    //点击说明标志以外的地方时,隐藏说明弹出框
		document.addEventListener('click', (e) => {
			if (e.target.className != 'exclamation-point-png'){
				this.beaconList.forEach((innerItem) => { return innerItem.isShowExplain = false });
			};
		}, false)
  },

  beforeDestroy () {
    if (this.timeOne) {
      clearTimeout(this.timeOne)
    };
    if (this.isLoadDataTime) {
      clearTimeout(this.isLoadDataTime)
    }
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo"]),
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
    ...mapMutations([]),

    // 顶部导航左边点击事件
    onClickLeft () {
      this.$router.push({path: '/home'})
    },

    // 疑问点击事件
    questionMarkEvent (item) {
      this.beaconList.forEach((innerItem) => { if (item.departmentName != innerItem.departmentName) { return innerItem.isShowExplain = false } });
      item.isShowExplain = !item.isShowExplain
    },

    // 清除打卡点事件
    clearClockPointEvent () {
      this.deleteInfoShow = true
    },

    // 打卡测试事件
    clockTestEvent (item) {
      if (item.beacons.some((currentItem) => { return currentItem.currentSignal != 0}) && item.isSetClockPoint) {
        this.isShowSuccessShow = true
      }
    },

    // 设置打卡事件
    setClockEvent (item) {
      if (item.beacons.some((currentItem) => { return currentItem.currentSignal != 0})) {
        this.isShowSuccessShow = true
      }
    },

    // 删除弹框提示框关闭事件
    deleteCloseInfoEvent () {
      this.deleteInfoShow = false
    }, 

    // 是否成功失败提示框关闭事件
    isSuccessInfoEvent () {
      this.isShowSuccessShow = false
    },

    // 删除确定
    deleteSure () {
    },

    // 删除取消
    deleteCancel () {
    },

    // 楼栋下拉框值改变事件
    buildingOptionChange (val) {
      this.currentBuilding = val
    },

    // 打开蓝牙事件
    turnNoBluetoothEvent () {},

    // 信标列表注册滚动事件
    initScrollChange () {
      let boxBackScroll = this.$refs['departmentListBox'];
      boxBackScroll.addEventListener('scroll',this.beaconListLoadMore,true)
    },

    // 信标列表加载事件
    beaconListLoadMore () {
      // 暂存的数据不进行上拉加载
      if (this.storageRadio) {return};
      let boxBackScroll = this.$refs['departmentListBox'];
      if (Math.ceil(boxBackScroll.scrollTop) + boxBackScroll.offsetHeight >= boxBackScroll.scrollHeight) {
        // 点击筛选确定后，不加载数据
        if (!this.isLoadData) {return};
        if (this.eventTime) {return};
        this.eventTime = 1;
        this.timeTwo = setTimeout(() => {
          let totalPage = Math.ceil(this.totalCount/this.pageSize);
          if (this.currentPage >= totalPage) {
            if (this.isOnlyMe && this.fullBacklogTaskList.length == 0) {
              this.isShowBacklogTaskNoMoreData = false
            } else {
              this.isShowBacklogTaskNoMoreData = true
            }
          } else {
            this.isShowBacklogTaskNoMoreData = false;
            this.currentPage = this.currentPage + 1;
            if (this.isOnlyMe) {
              this.queryEventList(this.currentPage,this.pageSize,this.userName)
            } else {
              this.queryEventList(this.currentPage,this.pageSize)
            }
          };
          this.eventTime = 0;
          console.log('信标列表滚动了',boxBackScroll.scrollTop, boxBackScroll.offsetHeight, boxBackScroll.scrollHeight)
        },300)
      }
    },

    // 事件登记事件
    onClickRight () {
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
 .quit-info-box {
    /deep/ .van-dialog {
      .van-dialog__content {
          padding: 20px 16px 0 16px !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          .dialog-title {
            text-align: right
          };
          .dialog-top {
            line-height: 20px;
            padding: 20px 0 30px 0;
            text-align: center;
            box-sizing: border-box;
            > span {
                color: #101010;
                font-size: 16px;
                font-weight: bold;
                margin-right: 6px
            };
            img {
              vertical-align: top;
              margin-top: -2px;
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
  .is-success-info {
    /deep/ .van-dialog {
      .van-dialog__footer {
        padding: 10px 40px 20px 40px !important;
        box-sizing: border-box;
        justify-content: center;
        ::after {
          content: none
        };
        .van-dialog__confirm {
          height: 40px;
          background: #3B9DF9;
          color: #fff !important;
          border-radius: 8px;
          flex: none !important;
          width: 50%
        }
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
          >span {
            color: #fff;
            margin-left: 2px
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
        .info-box {
            height: 40px;
            display: flex;
            flex-direction: row nowrap;
            justify-content: space-between;
            align-items: center;
            padding: 0 4px;
            box-sizing: border-box;
            background: #F2AE9D;
            .info-content {
                font-size: 12px;
                color: #101010
            };
            .info-right {
                font-size: 14px;
                color: #0079FF
            }
        };
        .building-box {
            display: flex;
            height: 50px;
            padding: 0 4px;
            box-sizing: border-box;
            align-items: center;
            flex-flow: row nowrap;
            box-shadow: 0px 1px 4px 0px rgba(187, 187, 187, 1);
            > span {
                font-size: 12px;
                color: #101010;
                margin-right: 10px
            };
            /deep/ .vue-dropdown {
                width: 50%;
                .cur-name {
                  height: 28px;
                  line-height: 28px
                }
            }
        };
        .department-list-box {
            flex: 1;
            overflow: auto;
            .department-list {
                padding: 8px 4px;
                box-sizing: border-box;
                position: relative;
                .bottom-border-1px(#BBBBBB);
                .list-one-line {
                  display: flex;
                  height: 40px;
                  flex-flow: row nowrap;
                  justify-content: space-between;
                  align-items: center;
                  .one-line-left {
                    display: flex;
                    align-items: center;
                    .signal-is-have-box {
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      margin-right: 10px;
                      >img {
                        width: 14px;
                        height: 14px;
                        margin-bottom: 2px
                      };
                      >span {
                        font-size: 12px;
                        color: #BBBBBB
                      };
                      .strongSignal {
                        color: #289E8E !important
                      };
                      .weakSignal {
                        color: #F2A15F !important
                      }
                    };
                    .department-box {
                      color: #101010;
                      font-size: 16px
                    }
                  };
                  .one-line-right {
                    color: #E86F50;
                    font-size: 10px
                  };
                  .oneLineRightStyle {
                    color: #289E8E !important
                  }
                };
                .list-two-line {
                  margin: 4px 0 14px 0;
                  line-height: 20px;
                  .beacon-list {
                    display: flex;
                    flex-flow: row nowrap;
                    .beacon-left {
                      margin-right: 10px;
                      >span {
                        font-size: 10px;
                        color: #101010
                      }
                    };
                    .beacon-right {
                      flex: 1;
                      >span {
                        font-size: 10px;
                        color: #101010;
                        &:nth-child(2) {
                          color: #0079FF
                        }
                      }
                    }
                  }
                };
                .list-three-line {
                  display: flex;
                  flex-flow: row nowrap;
                  justify-content: space-between;
                  align-items: center;
                  .three-line-left {
                    width: 50%;
                    position: relative;
                    >img {
                      position: absolute;
                      width: 13px;
                      height: 13px;
                      right: 10px;
                      top: 50%;
                      transform: translateY(-50%)
                    };
                    >span {
                      display: inline-block;
                      font-size: 12px;
                      color: #fff;
                      padding: 6px 10px;
                      border-radius: 4px;
                      box-sizing: border-box;
                      background: #BBBBBB;
                      &:nth-child(1) {
                        margin-right: 6px
                      }
                    };
                    .canTestStyle {
                      background: #174E97 !important
                    };
                    .setClockPointStyle {
                      background: #289E8E !important
                    }
                  };
                  .three-line-right {
                    display: inline-block;
                    font-size: 12px;
                    padding: 6px 10px;
                    border-radius: 4px;
                    box-sizing: border-box;
                    color: #E86F50;
                    border: 1px solid #E86F50
                  }
                };
                .explain-box {
                  position: absolute;
                  box-shadow: 0px 1px 4px 0px #ececec;
                  left: 30%;
                  width: 55%;
                  border-radius: 4px;
                  padding: 10px 6px;
                  box-sizing: border-box;
                  top: 97%;
                  z-index: 1;
                  background: #fff;
                  .explain-title {
                    >img {
                      width: 14px;
                      height: 14px;
                      margin-right: 6px;
                      vertical-align: top
                    };
                    >span {
                      font-size: 12px;
                      color: #101010
                    }
                  };
                  .explain-content {
                    margin-top: 10px;
                    font-size: 12px;
                    color: #101010;
                    line-height: 20px;
                  }
                }
            }
        }
    }    
  }
}
</style>