<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
      <!-- <NavBar path="/workOrderDetails" title="工单完成签名" :leftArrow="false" :leftText="null" /> -->
    </div>
    <div class="content">
      <div class="content-left">
        <ElectronicSignature ref="mychild"></ElectronicSignature>
        <div class="btn-area">
          <div class="cancel-btn" @click="cancel">
            <span>取</span>
            <span>消</span>
          </div>
          <div class="overwrite-btn" @click="rewrite">
            <span>重</span>
            <span>写</span>
          </div>
          <div class="sure-btn" @click="sure">
            <span>确</span>
            <span>认</span>
          </div>
        </div> 
      </div>
      <div class="content-right">
        <span>巡</span>
        <span>更</span>
        <span>任</span>
        <span>务</span>
        <span>完</span>
        <span>成</span>
        <span>签</span>
        <span>名</span>
      </div>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import ElectronicSignature from '@/components/ElectronicSignature'
import { mapGetters, mapMutations } from "vuex";
import { taskComplete } from '@/api/escortManagement.js'
import {getAliyunSign} from '@/api/login.js'
import { base64ImgtoFile, rotateBase64Img } from '@/common/js/utils'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import axios from 'axios'
export default {
  name: "PatrolTaskElectronicSignaturePage",
  components: {
    NavBar,
    ElectronicSignature
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      loadingShow: false,
      isExpire: false,
      loadText: '提交中',
      imgOnlinePathArr: [],
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/workOrderDetails");
    // this.$nextTick(()=> {
    //   this.resizeScreen()
    // })
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","currentElectronicSignature","patrolTaskListMessage","ossMessage","timeMessage","originalSignature"])
  },

  methods: {
    ...mapMutations(["changeOssMessage","changeTimeMessage"]),


    resizeScreen() {
      const _this = this;
      // 利用 CSS3 旋转 对根容器逆时针旋转 90 度
      const detectOrient = function() {
        console.log('静茹了');
        let width = document.documentElement.clientWidth,
        height = document.documentElement.clientHeight,
        $wrapper = _this.$refs.wrapper, // 页面最外层元素
          style = "";
        if (width >= height) {
          // 横屏
          style += "width:" + width + "px;"; // 注意旋转后的宽高切换
          style += "height:" + height + "px;";
          style += "-webkit-transform: rotate(0); transform: rotate(0);";
          style += "-webkit-transform-origin: 0 0;";
          style += "transform-origin: 0 0;";
        } else {
          // 竖屏
          console.log('竖屏了');
          style += "width:" + height + "px;";
          style += "height:" + width + "px;";
          style += "min-height:auto;";
          style +=
            "-webkit-transform: rotate(90deg); transform: rotate(90deg);";
          // 注意旋转中点的处理
          style +=
            "-webkit-transform-origin: " +
            width / 2 +
            "px " +
            width / 2 +
            "px;";
          style += "transform-origin: " + width / 2 + "px " + width / 2 + "px;";
        }
        $wrapper.style.cssText = style;
      };
      window.onresize = detectOrient;
      detectOrient()
    },

    // 签名重写
    rewrite () {
      this.$refs.mychild.overwrite()
    },

    // 签名确认
    sure () {
      this.$refs.mychild.commitSure();
      if (this.currentElectronicSignature == this.originalSignature || !this.currentElectronicSignature) {
        this.$toast('签名不能为空');
        return
      };
      // canvas签名旋转
      rotateBase64Img(this.currentElectronicSignature,-90,this.signatureRotateCallback)
    },

    async signatureRotateCallback (signatureValue) {
     // 上传图片到阿里云服务器
      this.loadText ='提交中';
      this.overlayShow = true;
      this.loadingShow = true;
      if (Object.keys(this.timeMessage).length > 0) {
        // 判断签名信息是否过期
        if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
          await this.getSign();
          await this.uploadImageToOss(signatureValue)
        } else {
          await this.uploadImageToOss(signatureValue)
        }
      } else {
        await this.getSign();
        await this.uploadImageToOss(signatureValue)
      };
      // 完成任务接口
      taskComplete({
        taskId: this.patrolTaskListMessage.id, // 当前任务id
        signImage: this.imgOnlinePathArr[0], // 签名路径
        workerName: this.userInfo.name // 当前登陆员工
      }).then((res) => {
      if (res && res.data.code == 200) {
        this.loadingShow = false;
        this.overlayShow = false;
        this.$router.push({path: '/patrolTasklist'})
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

    // 获取阿里云签名接口
    getSign (filePath = '') {
      return new Promise((resolve, reject) => {
        getAliyunSign().then((res) => {
          if (res && res.data.code == 200) {
            // 存储签名信息
            this.changeOssMessage(res.data.data);
            let temporaryTimeInfo = {};
            temporaryTimeInfo['expire'] = Number(res.data.data.expire);
            // 存储过期时间信息
            this.changeTimeMessage(temporaryTimeInfo);
            if (this.isExpire) {
              this.uploadImageToOss(filePath)
            };
            this.isExpire = false;
            resolve()
          } else {
            this.overlayShow = false;
            this.loadingShow = false;
            this.$toast({
              message: `${res.data.msg}`,
              type: 'fail'
            });
            reject()
          }
        })
        .catch((err) => {
          this.overlayShow = false;
          this.loadingShow = false;
          this.$toast({
            message: `${err}`,
            type: 'fail'
          });
          reject()
        })
      })	
    },
    
    // 上传图片到阿里云服务器
    uploadImageToOss (filePath) {
      return new Promise((resolve, reject) => {
      // OSS地址
      const aliyunServerURL = this.ossMessage.host;
      // 存储路径(后台固定位置+随即数+文件格式)
      const aliyunFileKey = this.ossMessage.dir + new Date().getTime() + Math.floor(Math.random() * 100) + base64ImgtoFile(filePath).name;
      // 临时AccessKeyID0
      const OSSAccessKeyId = this.ossMessage.accessid;
      // 加密策略
      const policy = this.ossMessage.policy;
      // 签名
      const signature = this.ossMessage.signature;
      let formData = new FormData();
      formData.append('key',aliyunFileKey);
      formData.append('policy',policy);
      formData.append('OSSAccessKeyId',OSSAccessKeyId);
      formData.append('success_action_status','200');
      formData.append('Signature',signature);
      formData.append('file',base64ImgtoFile(filePath));
      axios({
          url: aliyunServerURL,
          method: 'post',
          data: formData,
          headers: {'Content-Type': 'multipart/form-data'}
      }).then((res) => {
          this.imgOnlinePathArr.push(`${aliyunServerURL}/${aliyunFileKey}`);
          resolve();
          console.log(this.imgOnlinePathArr);
      })
      .catch((err) => {
        this.overlayShow = false;
        this.loadingShow = false;
        this.$toast({
          message: `${err}`,
          type: 'fail'
        });
        reject()
      })
      })
    },

    // 签名取消
    cancel () {
      this.$refs.mychild.overwrite();
      this.$router.push({
        path: "/workOrderDetails"
      })
    },
  }
};
</script>
<style lang='less' scoped>
@import "~@/common/stylus/variable.less";
@import "~@/common/stylus/mixin.less";
@import "~@/common/stylus/modifyUi.less";
.page-box {
  .content-wrapper();
  height: 0;
  .van-overlay {
    z-index: 1000 !important
  };
  .van-loading {
    z-index: 10000 !important
  };
  .nav {
    width: 100%;
    height: 46px;
    /deep/ .van-nav-bar {
        .van-nav-bar__left {
        .van-nav-bar__text {
            color: #101010 !important;
            margin-left: 8px !important;
        }
        }
        .van-icon {
            color: #101010 !important;
            font-size: 22px !important;
        }
        .van-nav-bar__title {
          color: #101010 !important;
          font-size: 16px !important;
          margin: 0 !important;
          margin-left: 2% !important
        }
    }
  };
  .content {
    width: 92%;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: row;
    height: 0;
    .content-left {
      display: flex;
      flex: 1;
      flex-direction: column;
      .signature {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        /deep/ .signatureBox {
            width: 100% !important;
            flex: 1
        }
      };
      .btn-area {
        width: 100%;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 150px;
        >div {
          font-size: 14px;
          border-radius: 4px;
          margin-right: 20px;
          width: 39px;
          height: 95px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          >span {
            transform: rotate(90deg);
            margin-bottom: 2px
          }
        }
        .cancel-btn {
            background: #1684FC;
            color: #fff

        };
        .overwrite-btn {
            border: 1px solid #1684FC;
            color: #1684FC
        };
        .sure-btn {
            background: #E86F50;
            color: #fff;
            margin-right: 0
        }
      }
    };
    .content-right {
      width: 50px;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 20px;
      color: #101010;
      >span {
        transform: rotate(90deg)
      }
    }  
  }
}
</style>