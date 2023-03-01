<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">退出中...</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <van-dialog v-model="quitDialogShow" title="是否退出登录?" 
        confirm-button-color="#218FFF" show-cancel-button
        @confirm="quitDialogSureEvent"
        >
    </van-dialog>
    <div class="nav">
        <NavBar path="/home" title="个人中心" />
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
			<div class="content-top-content">
				<div class="user-photo">
					<img :src="defaultPersonPng" />
				</div>
				<div class="user-message">
					<div class="user-name">
						{{ userInfo.name }}
					</div>
					<div class="account-name">
						{{ userInfo.account }}
					</div>
				</div>
			</div>
		</div>
		<div class="content-bottom-area">
			<div class="content-top-other">
				<div class="left">
					<span>
						<img :src="hiredatePng" />
					</span>
					<span>入职时间</span>
				</div>
				<div class="right">
					<span>
						{{ userInfo.joinTime }}
					</span>
				</div>
			</div>
			<div class="content-top-other">
				<div class="left">
					<span>
						<img :src="phoneNumberPng" />
					</span>
					<span>手机号码</span>
				</div>
				<div class="right">
					<span>
						{{ userInfo.workPhone ? userInfo.workPhone : '无' }}
					</span>
				</div>
			</div>
			<div class="content-top-other">
				<div class="left">
					<span>
						<img :src="accountExpirationTimePng" />
					</span>
					<span>账号过期时间</span>
				</div>
				<div class="right">
					<span>
						无
					</span>
				</div>
			</div>
			<div class="content-top-other">
				<div class="left">
					<span>
						<img :src="userRolePng" />
					</span>
					<span>用户角色</span>
				</div>
				<div class="right">
					<span v-for="(item,index) in roleNameList" :key="index">
						{{ item }}
					</span>
				</div>
			</div>
		</div>
		<div class="content-bottom">
            <div class="app-version">
				<span>当前版本</span>
				<span>
					{{`V${versionNumber}`}}
				</span>
			</div>
			<div class="quit-account" @click="isLoginOut">退 出 账 号</div>
		</div>
    </div> 
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import {
	userSignOut
} from '@/api/login.js'
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import { removeAllLocalStorage } from "@/common/js/utils";
export default {
  name: "MyInfo",
  components: {
    NavBar
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      quitDialogShow: false,
      loadingShow: false,
      overlayShow: false,
      versionNumber: '0.1',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      accountExpirationTimePng: require("@/common/images/home/account-expiration-time.png"),
      hiredatePng: require("@/common/images/home/hiredate.png"),
      phoneNumberPng: require("@/common/images/home/phone-number.png"),
      userRolePng: require("@/common/images/home/user-role.png"),
      defaultPersonPng: require("@/common/images/home/default-person.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/home")
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo", "isLogin","roleNameList","globalTimer"])
  },

  methods: {
    ...mapMutations(["changeIsLogin","changeOverDueWay"]),

    // 退出登录事件
    isLoginOut () {
        this.quitDialogShow = true
    },

    //是否退出登录弹框确定事件
    quitDialogSureEvent () {
        this.loadingShow = true;
        this.overlayShow = true;
				this.changeOverDueWay(true);
				userSignOut().then((res) => {
          this.loadingShow = false;
          this.overlayShow = false;
					if (res && res.data.code == 200) {
						removeAllLocalStorage();
            if(this.globalTimer) {window.clearInterval(this.globalTimer)};
            this.$router.push({path: '/'})
					} else {
						this.$toast({
							message: `${res.data.msg}`,
							type: 'fail'
						});
						this.changeOverDueWay(false)
					}
				}).
				catch((err) => {
					this.$toast({
						message: `${err}`,
						type: 'fail'
					});
					this.changeOverDueWay(false);
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
    .content-top-area {
      position: relative;
      width: 100%;
      margin: 0 auto;
      height: 240px;
      > img {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
      .content-top-content {
        margin-left: 20px;
        height: 60px;
        margin-top: 60px;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        .user-photo {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: #fff;
          z-index: 1000;
          img {
            vertical-align: middle;
            width: 50px;
            height: 50px;
          }
        }
        .user-message {
          z-index: 100;
          margin-left: 16px;
          color: #fff;
          .user-name {
            font-size: 16px;
          }
          .account-name {
            font-size: 14px;
            margin-top: 6px;
          }
        }
      }
    }
    .content-bottom-area {
      flex: 1;
      overflow: auto;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      background: #fff;
      margin-top: -94px;
      padding-top: 10px;
      box-sizing: border-box;
      z-index: 1000;
      height: auto;
      font-size: 14px;
      .content-top-otherone {
        height: 100px;
      }

      .content-top-other {
        height: 45px;
        line-height: 45px;
        box-sizing: border-box;
        color: #101010;
        font-size: 14px;
        font-weight: bold;
        position: relative;
        .left {
          position: absolute;
          left: 0;
          top: 0;
          > span {
            color: black;
            &:first-child {
              img {
                vertical-align: middle;
                width: 22px;
                height: 22px;
              }
              padding-left: 20px;
              margin-right: 10px;
            }
          }
        }
        .right {
          position: absolute;
          right: 20px;
          top: 0;
          width: 60%;
          text-align: right;
          word-break: break-all;
          > span {
            color: black;
            padding-left: 20px;
          }
        }
      }
    }

    .content-bottom {
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      font-size: 13px;
      position: relative;

      .app-version {
        background: #fff;
        text-align: center;
        box-sizing: border-box;
        font-size: 14px;
        > span {
          &:first-child {
            margin-right: 10px;
          }
          color: #9e9e9a;
        }
      }

      .quit-account {
        height: 48px;
        width: 266px;
        font-size: 18px;
        margin: 0 auto;
        line-height: 48px;
        background: linear-gradient(to right, #6cd2f8, #2390fe);
        box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
        color: #fff;
        border-radius: 30px;
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 20px;
        text-align: center;
      }
    }
  }
}
</style>