<template>
  <div class="page-box" ref="wrapper">
    <!-- 删除提示框   -->
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
                <SelectSearch ref="registrantOption" :itemData="buildingOption" :curData="currentBuilding" @change="buildingOptionChange" />
            </div>
            <div class="department-list-box" ref="departmentListBox">
                <div class="department-list">

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
      deleteInfoShow: true,
      timeOne: null,
      isLoadDataTime: null,
      loadingShow: false,
      totalCount: '',
      eventTime: 0,
      currentBuilding: null,
      buildingOption: [],
      currentPage: 1,
      pageSize: 10,
      loadText: '加载中',
      exclamationPointPng: require("@/common/images/home/exclamation-point.png"),
      statusBackgroundPng: require("@/common/images/home/status-background.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/home");
    this.$nextTick(()=> {
      this.initScrollChange()
    })
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

    // 删除弹框提示关闭事件
    deleteCloseInfoEvent () {
        this.deleteInfoShow = false
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
            .vue-dropdown {
                width: 50%
            }
        };
        .department-list-box {
            flex: 1;
            overflow: auto;
            .department-list {
                padding: 8px 4px;
                box-sizing: border-box;
                .bottom-border-1px(#BBBBBB)
            }
        }
    }    
  }
}
</style>