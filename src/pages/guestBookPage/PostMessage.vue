<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
      <van-nav-bar title="发布留言" left-text="取消" left-arrow @click-left="onClickLeft" :border="false">
      </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
          <img :src="statusBackgroundPng" />
        </div>
        <div class="content-box">
            <div class="backlog-task-list-box" ref="scrollBacklogTask">
                <div class="comment-input">
                    <van-field
                        v-model="commentContent"
                        rows="7"
                        autosize
                        type="textarea"
                        show-word-limit
                        maxlength="200"
                        placeholder="请输入留言内容"
                    />
                </div>
                <div class="image-list">
                    <div v-for="(item, index) in resultImgList" :key="index">
                        <img :src="item" />
                        <div class="icon-box"  @click="issueDelete(index)">
                            <van-icon
                            name="delete"
                            color="#d70000"
                            />
                        </div>    
                    </div>
                    <div @click="issueClickEvent">
                        <van-icon name="plus" size="30" color="#101010" />
                    </div>
                </div> 
            </div>
            <div class="btn-box">
            <span class="operate-one" @click="postMessageEvent">发布</span>
            </div>
        </div>
    </div>
     <transition name="van-slide-up">
      <div class="choose-photo-box" v-show="photoBox">
        <div class="choose-photo">
          <van-icon name="photo" />
          <input
            name="uploadImg1"
            id="demo1"
            @change="previewFileOne"
            type="file"
            accept="image/album"
          />从图库中选择
        </div>
        <div class="photo-graph">
          <van-icon name="photograph" />
          <input
            name="uploadImg2"
            id="demo2"
            @change="previewFileTwo"
            type="file"
            accept="image/camera"
          />拍照
        </div>
        <div class="photo-cancel" @click="photoCancel">取消</div>
      </div>
    </transition>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import axios from 'axios'
import { mapGetters, mapMutations } from "vuex";
import { guestBookAdd } from '@/api/escortManagement.js'
import { compress,base64ImgtoFile } from "@/common/js/utils";
import {getAliyunSign} from '@/api/login.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
export default {
  name: "PostMessage",
  components: {
    NavBar,
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      loadingShow: false,
      photoBox: false,
      overlayShow: false,
      commentContent: '',
      loadText: '加载中',
      resultImgList: [],
      imgOnlinePathArr: [],
      statusBackgroundPng: require("@/common/images/home/status-background.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/guestBook")
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","timeMessage","ossMessage","enterPostMessagePageMessage"]),
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
    ...mapMutations(["changeTimeMessage","changeOssMessage"]),

    // 顶部导航左边点击事件
    onClickLeft () {
      this.$router.push({path: '/guestBook'})
    },

    // 发布事件
    async postMessageEvent () {
      if (!this.commentContent) {
        this.$toast({
          type: 'fail',
          message: '留言不能为空'
        });
        return
      };
      this.loadText ='发布中';
      this.overlayShow = true;
      this.loadingShow = true;
      let temporaryData = {
        userId: this.workerId,
        userName: this.userName,
        workers: this.enterPostMessagePageMessage['workers'], //任务集参与者
        collect: this.enterPostMessagePageMessage['collect'], //巡更集名称
        content: this.commentContent,
        extendData:{},
        images:[],
        state: '',
        system: 6
      };
      // 上传图片到阿里云服务器
      if (this.resultImgList.length > 0) {
        for (let imgI of this.resultImgList) {
          if (Object.keys(this.timeMessage).length > 0) {
            // 判断签名信息是否过期
            if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
              await this.getSign();
              await this.uploadImageToOss(imgI)
            } else {
              await this.uploadImageToOss(imgI)
            }
          } else {
            await this.getSign();
            await this.uploadImageToOss(imgI)
          }
        };
        temporaryData['images'] = this.imgOnlinePathArr
      };
      this.addGuestBook(temporaryData)
    },

    // 留言发布
    addGuestBook (data) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '发布中';
      guestBookAdd(data).then((res) => {
        if (res && res.data.code == 200) {
          this.loadingShow = false;
          this.overlayShow = false;
          this.$toast({
            type: 'fail',
            message: '发布成功'
          });
          this.$router.push({path: '/guestBook'})
        } else {
          this.imgOnlinePathArr = [];
          this.$toast({
            type: 'fail',
            message: res.data.msg
          })
        }
      })
      .catch((err) => {
        this.imgOnlinePathArr = [];
        this.loadingShow = false;
        this.overlayShow = false;
        this.$toast({
          type: 'fail',
          message: err
        })
      })
    },
    
    // 图片上传预览
    previewFileOne() {
      let file = document.getElementById("demo1").files[0];
      console.log('图片文件流',file);
      let _this = this;
      let reader = new FileReader();
      let isLt2M = file.size / 1024 / 1024 < 16;
      if (!isLt2M) {
        this.$dialog
          .alert({
            message: "上传图片大小不能超过16MB!",
            closeOnPopstate: true,
          })
          .then(() => {});
        return;
      }
      reader.addEventListener(
        "load",
        function () {
          // 压缩图片
          let result = reader.result;
          let img = new Image();
          img.src = result;
          img.onload = function () {
            let src = compress(img);
             console.log('压缩后的路劲',src);
            _this.resultImgList.push(src);
            _this.photoBox = false;
            _this.overlayShow = false
          };
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
    },

    //拍照预览
    previewFileTwo() {
      let file = document.getElementById("demo2").files[0];
      let _this = this;
      let reader = new FileReader();
      let isLt2M = file.size / 1024 / 1024 < 16;
      if (!isLt2M) {
        _this.$dialog
          .alert({
            message: "上传图片大小不能超过16MB!",
            closeOnPopstate: true,
          })
          .then(() => {});
        return;
      }
      reader.addEventListener(
        "load",
        function () {
          // 压缩图片
          let result = reader.result;
          let img = new Image();
          img.src = result;
          img.onload = function () {
            let src = compress(img);
            _this.resultImgList.push(src);
            _this.photoBox = false;
            _this.overlayShow = false
          };
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
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
            console.log('阿里云图片',this.imgOnlinePathArr)
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


    // 拍照点击
    issueClickEvent() {
      if (this.resultImgList.length >= 5) {
        this.$toast({
          message: '至多只能上传5张照片',
          type: 'fail'
        });
        return
      };
      this.photoBox = true;
      this.overlayShow = true;
    },

    // 照片删除事件事件
    issueDelete (index) {
      this.resultImgList.splice(index, 1)
    },

    // 拍照取消
    photoCancel() {
      this.photoBox = false;
      this.overlayShow = false;
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
    .choose-photo-box {
    position: fixed;
    margin: auto;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 1000;
    font-size: 0;
    > div {
      width: 100%;
      text-align: center;
      font-size: 16px;
      background: #f6f6f6;
    }
    .choose-photo {
      padding: 8px 10px;
      height: 30px;
      .bottom-border-1px(#cbcbcb);
      line-height: 30px;
      position: relative;
      cursor: pointer;
      color: @color-theme;
      overflow: hidden;
      display: inline-block;
      *display: inline;
      *zoom: 1;
      /deep/ .van-icon {
        vertical-align: top;
        font-size: 20px;
        display: inline-block;
        line-height: 30px;
      }
      input {
        position: absolute;
        font-size: 100px;
        right: 0;
        top: 0;
        height: 100%;
        opacity: 0;
        filter: alpha(opacity=0);
        cursor: pointer;
      }
    }
    .photo-graph {
      position: relative;
      display: inline-block;
      height: 50px;
      overflow: hidden;
      .bottom-border-1px(#cbcbcb);
      color: @color-theme;
      text-decoration: none;
      text-indent: 0;
      line-height: 50px;
      /deep/ .van-icon {
        vertical-align: top;
        font-size: 20px;
        display: inline-block;
        line-height: 50px;
      }
      input {
        position: absolute;
        font-size: 100px;
        right: 0;
        height: 100%;
        top: 0;
        opacity: 0;
      }
    }
    .photo-cancel {
      position: relative;
      display: inline-block;
      padding: 8px 12px;
      overflow: hidden;
      color: @color-theme;
      text-decoration: none;
      text-indent: 0;
      line-height: 30px;
      font-weight: bold;
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
          .van-nav-bar__text {
            color: #fff
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
        .backlog-task-list-box {
          padding-top: 10px;
          box-sizing: border-box;
          position: relative;
          flex: 1;
          overflow: auto;
        .comment-input {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            /deep/ .van-cell {
                border-radius: 4px;
                padding: 4px 6px !important;
                background: #fff
            }
        };
        .image-list {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          background: #fff;
          padding: 6px 8px;
          box-sizing: border-box;
          > div {
            width: 31%;
            height: 100px;
            vertical-align: top;
            margin-right: 2%;
            margin-top: 2%;
            position: relative;
            &:nth-child(1) {
              margin-top: 0;
            }
            &:nth-child(2) {
              margin-top: 0;
            }
            &:nth-child(3) {
              margin-top: 0;
            }
            &:nth-child(3n + 3) {
              margin-right: 0;
            }
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
              height: 100%;
            }
            &:last-child {
             display: flex;
             justify-content: center;
             align-items: center;
              background: #f2f2f2;
              /deep/ .van-icon {
                position: relative;
                top: 0;
                right: 0;
              }
            }
          }
        }
      };
       .btn-box {
          width: 90%;
          margin: 0 auto;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          >span {
            width: 80%;
            display: inline-block;
            height: 45px;
            font-size: 18px;
            line-height: 45px;
            color: #fff;
            background: linear-gradient(to right, #6cd2f8, #2390fe);
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            text-align: center;
            border-radius: 30px
          }
        }
    }    
  }
}
</style>