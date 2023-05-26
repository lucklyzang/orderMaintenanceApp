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
    <!-- 是否重新设置打卡点提示框   -->
    <div class="quit-info-box">
       <van-dialog v-model="isAgainSetPointShow" show-cancel-button width="90%"
          @confirm="isAgainSetPointSureEvent" @cancel="isAgainSetPointCancelEvent" confirm-button-text="取消"
          cancel-button-text="确定"
        >
          <div class="dialog-title">
            <van-icon name="cross" size="22" @click="isAgainSetPointCloseEvent"/>
          </div>
          <div class="dialog-top">
            <img :src="exclamationPointPng">
            <span>该科室已设置打卡点，是否重新设置</span>
          </div>
        </van-dialog>
    </div>               
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
      <van-nav-bar title="信标列表" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
           <template #right>
                <van-icon name="replay" size="18" color="#fff" />
                <span @click="onClickRight">刷新</span>
            </template>
      </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
          <img :src="statusBackgroundPng" />
        </div>
        <div class="content-box">
            <div class="info-box" v-show="!isBlueOpen">
                <div class="info-content">当前蓝牙未打开，请打开手机蓝牙后再进行操作</div>
                <div class="info-right" @click="turnNoBluetoothEvent">去打开</div>
            </div>
            <div class="building-box" ref="buildingBox" v-show="isBlueOpen">
                <span>楼栋选择</span>
                <SelectSearch ref="registrantOption" :itemData="buildingOption" :curData="currentBuilding" @change="buildingOptionChange" :isNeedSearch="false" />
            </div>
            <div class="department-list-box" ref="departmentListBox" v-show="isBlueOpen">
                <div class="department-list" v-for="(item,index) in beaconList" :key="index">
                  <div class="list-one-line">
                    <div class="one-line-left">
                      <div class="signal-is-have-box">
                        <img :src="item.beaconList.every((currentItem) => { return currentItem.rssi == 0}) ? signalNoPng : item.beaconList.every((currentItem) => { return currentItem.rssi == 1}) ?  signalWeakPng : signalStrongPng " alt="信号标记" />
                        <span :class="{'strongSignal':item.beaconList.some((currentItem) => { return currentItem.rssi == 2}),'weakSignal':item.beaconList.every((currentItem) => { return currentItem.rssi == 1})}">{{ item.beaconList.every((currentItem) => { return currentItem.rssi == 0}) ? '无信号' : item.beaconList.every((currentItem) => { return currentItem.rssi == 1}) ? '信号弱' : '信号强'}}</span>
                      </div>
                      <div class="department-box">{{ item.depName }}</div>
                    </div>
                    <div class="one-line-right" :class="{'oneLineRightStyle':item.range}">
                      {{ item.range ? '打卡点已设置':'打卡点未设置'}}
                    </div>
                  </div>
                  <div class="list-two-line">
                    <div class="beacon-list" v-for="(innerItem,innerIndex) in item.beaconList" :key="innerIndex">
                      <div class="beacon-left">
                        <span>信标编号:</span>
                        <span>{{ innerItem.number }}</span>
                      </div>
                      <div class="beacon-right">
                        <span class="span-one">当前信号:</span>
                        <span class="span-two">{{ innerItem.rssi == 0 ? "无信号" : `${innerItem.rssi}dBm`}}</span>
                        <span class="span-three" v-show="item.range">{{`(${innerItem.ranged}dBm)`}}</span>
                        <span class="span-four" v-show="innerItem.dumpEnergy != null">{{ innerItem.dumpEnergy < 2 ? `${innerItem.dumpEnergy}%` : ''}}</span>
                      </div>
                    </div>
                  </div>
                  <div class="list-three-line">
                    <div class="three-line-left">
                      <span :class="{'canTestStyle':item.beaconList.some((currentItem) => { return currentItem.rssi != 0}) && item.range}" @click="clockTestEvent(item)">打卡测试</span>
                      <span :class="{'setClockPointStyle':item.beaconList.some((currentItem) => { return currentItem.rssi != 0})}" @click="setClockEvent(item,index)">设置打卡点</span>
                      <img :src="questionMarkPng" alt="疑问" @click="questionMarkEvent(item)" class="exclamation-point-png" />
                    </div>
                    <div class="three-line-right" v-show="item.range">
                      <span @click="clearClockPointEvent(item,index)">清除打卡点</span>
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
                <van-empty description="暂无数据" v-show="emptyShow" />
                <div class="no-more-data" v-show="isShowBeaconListNoMoreData && !emptyShow">没有更多数据了!</div>
            </div>
        </div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import { queryStructure, queryBeaconList, setBeaconConfigRange, clearBeaconRange } from '@/api/escortManagement.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import { IsPC } from '@/common/js/utils';
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
      isLoadMore: true,
      windowTimer: null,
      isTimeoutContinue: true,
      loadingShow: false,
      emptyShow: false,
      isBlueOpen: true,
      deleteInfoShow: false,
      deleteIndex: null,
      isAgainSetPointShow: false,
      isShowSuccessShow: false,
      showIsSuccessText: '打卡成功！',
      isSuccessIcon: true,
      timeOne: null,
      timeTwo: null,
      timeThree: null,
      timeFour: null,
      currentDepName: null,
      isShowBeaconListNoMoreData: false,
      totalCount: '',
      eventTime: 0,
      depId: '',
      currentBuilding: null,
      beaconList: [],
      temporaryBeaconList: [],
      buildingOption: [{text:'请选择',value:null}],
      currentPage: 1,
      pageSize: 10,
      loadText: '加载中...',
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
        this.$forceUpdate()
			};
		}, false);
    // 判断用户是否打开了位置权限，没有打开，就弹框提示
    if (!IsPC()) {
      try {
        window.android.useBluetooth()
      } catch (err) {
        this.$toast({
          type: 'fail',
          message: `${err}`
        })
      }
    };  
    // 查询建筑信息
    this.getStructure();
    // 查询信标信息
    this.getBeaconList('');
    if (!this.windowTimer) {
      // 轮询信标信息列表
      this.windowTimer = window.setInterval(() => {
        if (this.isTimeoutContinue) {
          setTimeout(this.pollingGetBeaconList(!this.currentBuilding ? this.currentBuilding : this.currentBuilding.value), 0)
        }
      }, 10000);
      // 轮询设备蓝牙是否打开
      if (!IsPC()) {
        this.windowTimer = window.setInterval(() => {
          setTimeout(this.judgeIsOpenBluetooth(), 0)
        }, 2000)
      };  
      this.changeGlobalTimer(this.windowTimer)
    }
  },

  beforeDestroy () {
    if (this.timeOne) {
      clearTimeout(this.timeOne)
    };
    if (this.timeTwo) {
      clearTimeout(this.timeTwo)
    };
    if (this.timeThree) {
      clearTimeout(this.timeThree)
    };
    if (this.windowTimer) {
      clearInterval(this.windowTimer)
    };
    if (this.timeFour) {
      clearInterval(this.timeFour)
    }
  },

  watch: {
    currentBuilding: {
      handler: function(newVal, oldVal) {
        this.currentDepName = newVal.value
      },
      deep: true
    }
  },

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
    ...mapMutations(['changeGlobalTimer']),

    // 顶部导航左边点击事件
    onClickLeft () {
      this.$router.push({path: '/home'})
    },

    // 疑问点击事件
    questionMarkEvent (item) {
      this.beaconList.forEach((innerItem) => { if (item.depName != innerItem.depName) { return innerItem.isShowExplain = false } });
      item.isShowExplain = !item.isShowExplain;
      this.$forceUpdate()
    },

    // 清除打卡点事件
    clearClockPointEvent (item,index) {
      this.depId = item.depId;
      this.deleteIndex = index;
      this.deleteInfoShow = true
    },

    // 打卡测试事件
    clockTestEvent (item) {
      if (item.beaconList.some((currentItem) => { return currentItem.rssi != 0}) && item.range) {
        this.loadingShow = true;
        this.overlayShow = true;
        this.loadText = '打卡测试中...';
        this.timeFour = setTimeout(() => {
          this.loadingShow = false;
          this.overlayShow = false;
          this.isShowSuccessShow = true;
          this.isSuccessIcon = true;
          this.showIsSuccessText = '打卡成功!'
        },2000)
      }
    },

    // 设置打卡事件
    setClockEvent (item,index) {
      if (item.beaconList.some((currentItem) => { return currentItem.rssi != 0})) {
        this.deleteIndex = index;
        if (item.range) {
          this.depId = item.depId;
          this.isAgainSetPointShow = true
        } else {
          this.setBeaconRange(item.depId)
        }
      }
    },

    // 设置信标打开范围
    setBeaconRange (depId) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '设置中...';
      setBeaconConfigRange({depId,proId:this.proId}).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          this.isShowSuccessShow = true;
          this.isSuccessIcon = true;
          this.showIsSuccessText = '设置打卡点成功!';
          this.isLoadMore = false;
          this.temporaryBeaconList[this.deleteIndex]['range'] = true;
          this.beaconList = this.temporaryBeaconList.slice(0,(this.currentPage - 1) * this.pageSize + this.pageSize);
          this.isLoadMore = true
        } else {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          })
        }
      })
      .catch((err) => {
        this.loadingShow = false;
        this.overlayShow = false;
        this.$dialog.alert({
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {
        })
      })
    },

    // 删除打卡点弹框提示框关闭事件
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

    // 删除打卡点取消
    deleteCancel () {
      this.overlayShow = true;
      this.loadingShow = true;
      this.loadText = '清除中...';
      clearBeaconRange({depId: this.depId,proId:this.proId}).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          this.isShowSuccessShow = true;
          this.isSuccessIcon = true;
          this.showIsSuccessText = '清除打卡点成功!';
          this.isLoadMore = false;
          this.temporaryBeaconList[this.deleteIndex]['range'] = false;
          this.beaconList = this.temporaryBeaconList.slice(0,(this.currentPage - 1) * this.pageSize + this.pageSize);
          this.isLoadMore = true
        } else {
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
          })
        }
      })
      .catch((err) => {
        this.loadingShow = false;
        this.overlayShow = false;
        this.$dialog.alert({
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {
        })
      })
    },

    // 重新设置打卡点确定事件
    isAgainSetPointSureEvent () {
    },

    // 重新设置打卡点取消事件
    isAgainSetPointCancelEvent () {
      this.setBeaconRange(this.depId)
    },

    // 重新设置打卡点关闭事件
    isAgainSetPointCloseEvent () {
      this.isAgainSetPointShow = false
    },

    // 楼栋下拉框值改变事件
    buildingOptionChange (val) {
      this.currentPage = 1;
      this.isShowBeaconListNoMoreData = false;
      this.isLoadMore = false;
      this.currentBuilding = val;
      this.getBeaconList(val.value)
    },

    // 打开蓝牙事件
    turnNoBluetoothEvent () {
      // 去往打开蓝牙设置页
      try {
        window.android.openBle()
      } catch (err) {
        this.$toast({
          type: 'fail',
          message: `${err}`
        })
      }
    },

    // 判断设备是否打卡蓝牙
    judgeIsOpenBluetooth () {
      try {
        if (window.android.isBleOpen() == 'true') {
          this.isBlueOpen = true
        } else {
          this.isBlueOpen = false
        }
      } catch (err) {
        this.$toast({
          type: 'fail',
          message: `${err}`
        });
        this.isBlueOpen = false
      }
    },

    // 信标列表注册滚动事件
    initScrollChange () {
      let boxBackScroll = this.$refs['departmentListBox'];
      boxBackScroll.addEventListener('scroll',this.beaconListLoadMore,true)
    },

    // 信标列表加载事件
    beaconListLoadMore () {
      if (!this.isLoadMore) { return };
      let boxBackScroll = this.$refs['departmentListBox'];
      if (Math.ceil(boxBackScroll.scrollTop) + boxBackScroll.offsetHeight + this.$refs['buildingBox'].offsetHeight >= boxBackScroll.scrollHeight) {
        if (this.eventTime) {return};
        this.eventTime = 1;
        this.timeTwo = setTimeout(() => {
          let totalPage = Math.ceil(this.totalCount/this.pageSize);
          if (this.currentPage >= totalPage) {
            if (this.beaconList.length == 0) {
              this.isShowBeaconListNoMoreData = false
            } else {
              this.isShowBeaconListNoMoreData = true
            }
          } else {
            this.isShowBeaconListNoMoreData = false;
            this.currentPage = this.currentPage + 1;
            this.loadingShow = true;
            this.overlayShow = true;
            this.loadText = '加载中...';
            // 模拟ajax请求
            this.timeThree = setTimeout(() =>{
              this.loadingShow = false;
              this.overlayShow = false;
              let currentPageList = this.temporaryBeaconList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
              // 合并已经加载的数据
              this.beaconList = this.beaconList.concat(currentPageList);
              this.beaconList.forEach((item) => { return item.isShowExplain = false})
            },1000)
          };
          this.eventTime = 0
        },300)
      }
    },

    // 查询信标列表
    getBeaconList (stucId) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.emptyShow = false;
      this.loadText = '加载中...';
      this.beaconList = [];
      queryBeaconList({proId:this.proId,stucId}).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        this.isLoadMore = true;
        if (res && res.data.code == 200) {
          if (res.data.data.length == 0) {
            this.emptyShow = true
          } else {
            this.temporaryBeaconList = res.data.data;
            this.totalCount = res.data.data.length;
            this.temporaryBeaconList.forEach((item) => { return item.isShowExplain = false});
            this.beaconList = this.temporaryBeaconList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
            this.$forceUpdate()
          }
        } else {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true
          }).then(() => {
          })
        }
      })
      .catch((err) => {
        this.isLoadMore = true;
        this.loadingShow = false;
        this.overlayShow = false;
        this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
        })
      })
    },

    // 轮询询信标列表
    pollingGetBeaconList (stucId) {
      this.isTimeoutContinue = false;
      queryBeaconList({proId:this.proId,stucId}).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          this.isTimeoutContinue = true;
          if (res.data.data.length == 0) {
            this.emptyShow = true
          } else {
            this.emptyShow = false;
            if (!this.currentBuilding) {
              if (this.currentDepName != this.currentBuilding) { return };
            } else {
              if (this.currentDepName != this.currentBuilding.value) { return }
            };
            for (let i = 0, len = res.data.data.length; i < len; i++ ) {
              for (let innerI = 0, innerLen = this.temporaryBeaconList.length; innerI < innerLen; innerI++ ) {
                if (res.data.data[i]['depId'] == this.temporaryBeaconList[innerI]['depId']) {
                  res.data.data[i]['isShowExplain'] = this.temporaryBeaconList[innerI]['isShowExplain'];
                  break
                }
              }    
            };
            // 更新已经加载出来的列表数据
            this.temporaryBeaconList = res.data.data;
            this.beaconList = this.temporaryBeaconList.slice(0,(this.currentPage - 1) * this.pageSize + this.pageSize);
            this.$forceUpdate()
          }
        }
      })
      .catch((err) => {
      })
    },

    // 查询建筑信息
    getStructure () {
      this.buildingOption = [{text:'请选择',value:null}];
      queryStructure(this.proId).then((res) => {
        if (res && res.data.code == 200) {
          if (res.data.data.length > 0) {
            for (let item of res.data.data) {
              this.buildingOption.push({
                text: item.name,
                value: item.id
              })
            }  
          }
        } else {
          this.$dialog.alert({
            message: `${res.data.msg}`,
            closeOnPopstate: true
          }).then(() => {
          })
        }
      })
      .catch((err) => {
        this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {
        })
      })
    },

    // 刷新事件
    onClickRight () {
      if (!this.isBlueOpen) {
        this.$toast({
          type: 'fail',
          message: '请打开设备蓝牙'
        });
        return
      };
      this.currentPage = 1;
      this.isLoadMore = false;
      this.isShowBeaconListNoMoreData = false;
      this.getBeaconList(!this.currentBuilding ? this.currentBuilding : this.currentBuilding.value)
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
                border-radius: 6px;
                .cur-name {
                  height: 28px;
                  line-height: 28px
                }
            }
        };
        .department-list-box {
            flex: 1;
            overflow: auto;
            position: relative;
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
                    flex: 1;
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
                      font-size: 16px;
                      word-break: break-all;
                      flex: 1;
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
                      width: 160px;
                      margin-right: 4px;
                      display: flex;
                      flex-flow: row nowrap;
                      >span {
                        font-size: 10px;
                        color: #101010;
                        &:nth-child(2) {
                          flex: 1;
                          .no-wrap()
                        }
                      }
                    };
                    .beacon-right {
                      flex: 1;
                      word-break: break-all;
                      >span {
                        font-size: 10px;
                        color: #101010
                      };
                      .span-two {
                        color: #0079FF
                      };
                      .span-four {
                        color: #E86F50
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
                      right: 2px;
                      top: 50%;
                      transform: translateY(-50%)
                    };
                    >span {
                      display: inline-block;
                      font-size: 12px;
                      color: #fff;
                      width: 74px;
                      padding: 6px 2px;
                      text-align: center;
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
                  padding: 12px 8px;
                  box-sizing: border-box;
                  top: 97%;
                  z-index: 1;
                  background: #fff;
                  .explain-title {
                    height: 16px;
                    display: flex;
                    align-items: center;
                    >img {
                      width: 14px;
                      height: 14px;
                      margin-right: 4px
                    };
                    >span {
                      font-size: 12px;
                      color: #101010
                    }
                  };
                  .explain-content {
                    margin-top: 6px;
                    font-size: 12px;
                    color: #101010;
                    line-height: 20px;
                  }
                }
            };
            .no-more-data {
              line-height: 30px;
              width: 100%;
              text-align: center;
              color: #afafaf;
              font-size: 12px
            };
            /deep/ .van-empty {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%,-50%);
            } 
        }
    }    
  }
}
</style>