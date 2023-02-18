<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
      <van-nav-bar title="留言簿" left-text="返回" left-arrow @click-left="onClickLeft" :border="false">
      </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
          <img :src="statusBackgroundPng" />
        </div>
        <div class="content-box">
            <div class="action-bar">
                <div class="action-bar-left">
                  <van-checkbox v-model="storageRadio" shape="square" @change="checkboxChangeEvent">只看我参与得任务</van-checkbox>
                </div>
            </div>
            <div class="backlog-task-list-box" ref="scrollBacklogTask">
              <div class="backlog-task-list" v-for="(item,index) in backlogTaskList" :key="index">
                  <div class="backlog-task-top">
                      <div class="backlog-task-top-left">
                          <span>事件类型</span>
                      </div>
                      <div class="backlog-task-top-right">
                          <span>{{ item.state }}</span>
                      </div>
                  </div>
                  <div class="backlog-task-content">
                    <div class="message-content">
                        一号楼二楼楼梯口不晓得谁倒了一桶油，差点滑倒，后来人注意一下！
                    </div>
                    <div class="image-area">
                        <img :src="subtractIconPng" alt="" @click="enlareEvent(subtractIconPng)">
                        <img :src="subtractIconPng" alt="">
                        <img :src="subtractIconPng" alt="">
                        <img :src="subtractIconPng" alt="">
                    </div>
                    <div class="message-line-one">
                        <div class="message-line-left">
                            <span>2023-02-02  16:31</span>
                            <span @click="deleteGuestbookEvent(item)">删除</span>
                        </div>
                        <div class="message-line-right">
                            <span @click="giveLike(item)">
                                <img :src="likeIconPng" alt="">
                                3
                            </span>
                            <span>
                                <img :src="messageIconPng" alt="">
                                3
                            </span>
                        </div>
                    </div>
                    <div class="like-person">
                        <img :src="haveLikeIconPng" alt="">
                        <span>张总、王主管、李领班</span>
                    </div>
                    <div class="comment">
                       <div class="comment-list">
                           <div class="comment-top">
                               <span>2023-02-02  11:31</span>
                               <span @click="deleteCommentEvent(item)">删除</span>
                           </div>
                           <div class="comment-bottom">
                               <span>泰罗奥特曼:</span>
                               <span>
                                   我四点去的时候保洁已经打扫好了
                               </span>
                           </div>
                       </div>
                       <div class="comment-list">
                           <div class="comment-top">
                               <span>2023-02-02  11:31</span>
                               <span>删除</span>
                           </div>
                           <div class="comment-bottom">
                               <span>泰罗奥特曼:</span>
                               <span>
                                   我四点去的时候保洁已经打扫好了
                               </span>
                           </div>
                       </div>
                    </div>
                    <div>
                    <div class="comment-input">
                      <van-field
                            v-model="commentContent"
                            rows="1"
                            autosize
                            type="textarea"
                            placeholder="评论"
                        />
                      </div>
                    </div>
                  </div>
              </div>
              <van-empty description="暂无数据" v-show="backlogEmptyShow" />
              <div class="no-more-data" v-show="isShowBacklogTaskNoMoreData">没有更多数据了</div>
          </div> 
         <div class="btn-box">
          <span class="operate-one" @click="postMessageEvent">发布留言</span>
        </div>
        </div>
    </div>
    <div class="comment-area">
      <van-field
        v-model="commentContent"
        rows="1"
        autosize
        type="textarea"
        placeholder="说点什么吧..."
      />
      <span @click="commentEvent">发送</span>
    </div>
    <div class="img-dislog-box">
        <van-dialog v-model="imgBoxShow" width="98%" :close-on-click-overlay="true" confirm-button-text="关闭">
            <img :src="currentImgUrl" />
        </van-dialog> 
    </div>  
  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import {queryGuestBook, guestBookDelete, guestCommentDelete, guestCommentAdd, guestSupport, guestCancel} from '@/api/escortManagement.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
export default {
  name: "GuestBook",
  components: {
    NavBar,
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      overlayShow: false,
      dateQueryRangeShow: false,
      isOnlyMe: true,
      backlogEmptyShow: false,
      screenDialogShow: false,
      isShowBacklogTaskNoMoreData: false,
      storageRadio: true,
      currentImgUrl: '',
      currentDateRange: '',
      commentContent: '',
      imgBoxShow: false,
      backlogTaskList: [
        {
          state: 1,
          eventType: '拾金不昧',
          problemType: '飒飒飒飒',
          describe: '飒飒飒飒啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
        },
         {
          state: 1,
          eventType: '拾金不昧',
          problemType: '飒飒飒飒',
          describe: '飒飒飒飒啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
        },
         {
          state: 1,
          eventType: '拾金不昧',
          problemType: '飒飒飒飒',
          describe: '飒飒飒飒啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊'
        }
      ],
      loadingShow: false,
      queryDataSuccess: false,
      loadText: '加载中',
      subtractIconPng: require("@/common/images/home/subtract-icon.png"),
      likeIconPng: require("@/common/images/home/like-icon.png"),
      haveLikeIconPng: require("@/common/images/home/have-like-icon.png"),
      messageIconPng: require("@/common/images/home/message-icon.png"),
      statusBackgroundPng: require("@/common/images/home/status-background.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/home");
    // 获取留言列表
    this.getGuestBook({
      date: '',
      userId: this.workerId,
      collect: ''
    })
  },

  watch: {},

  computed: {
    ...mapGetters(["userInfo","patrolTaskListMessage","departmentCheckList","enterPostMessagePageMessage"]),
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
    ...mapMutations(["changeDepartmentCheckList","changePatrolTaskListMessage","changeEnterPostMessagePageMessage"]),

    // 顶部导航左边点击事件
    onClickLeft () {
      this.$router.push({path: '/home'})
    },

    // 只看我参与的任务复选框值变化事件
    checkboxChangeEvent (checked) {
      if (checked) {
        this.getGuestBook({
          date: '',
          userId: this.workerId,
          collect: ''
        })
      } else {
        this.getGuestBook({
          date: '',
          userId: '',
          collect: ''
        })
      }
    },

    // 发布留言
    postMessageEvent () {
      let temporaryEnterPostMessagePageMessage = this.enterPostMessagePageMessage;
      temporaryEnterPostMessagePageMessage['collect'] = '';
      temporaryEnterPostMessagePageMessage['workers'] = '';
      this.changeEnterPostMessagePageMessage(temporaryEnterPostMessagePageMessage);
      this.$router.push({path: '/postMessage'})
    },

    // 图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 获取留言簿列表
    getGuestBook (data) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.backlogEmptyShow = false;
      this.loadText = '加载中';
      this.backlogTaskList = [];
      queryGuestBook(data).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (res.data.data.length == 0) {
            this.backlogEmptyShow = true
          };
          console.log('留言',res.data.data)
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

    // 删除留言(只能删除自己的留言)
    deleteGuestbookEvent (item) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '删除中';
      guestBookDelete(item.id).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (this.storageRadio) {
            this.getGuestBook({
              date: '',
              userId: this.workerId,
              collect: ''
            })
          } else {
            this.getGuestBook({
              date: '',
              userId: '',
              collect: ''
            })
          }
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

    //删除评论事件(只能删除自己的评论)
    deleteCommentEvent (item) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '删除中';
      guestCommentDelete(item.id).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (this.storageRadio) {
            this.getGuestBook({
              date: '',
              userId: this.workerId,
              collect: ''
            })
          } else {
            this.getGuestBook({
              date: '',
              userId: '',
              collect: ''
            })
          }
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

    //点赞事件(可以取消自己的点赞)
    giveLike (item) {
      this.loadingShow = true;
      this.overlayShow = true;
      //点赞
      if (true) {
         this.loadText = '点赞中';
          guestSupport({
            userId: this.workerId,
            userName: this.userName,
            guestId: item.id,
            system: 6
          }).then((res) => {
            if (res && res.data.code == 200) {
              this.loadingShow = false;
              this.overlayShow = false;
              if (this.storageRadio) {
                this.getGuestBook({
                  date: '',
                  userId: this.workerId,
                  collect: ''
                })
              } else {
                this.getGuestBook({
                  date: '',
                  userId: '',
                  collect: ''
                })
              }
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
      // 取消点赞
      } else {
        this.loadText = '取消中';
        guestCancel(item.id).then((res) => {
            this.loadingShow = false;
            this.overlayShow = false;
            if (res && res.data.code == 200) {
              if (this.storageRadio) {
                this.getGuestBook({
                  date: '',
                  userId: this.workerId,
                  collect: ''
                })
              } else {
                this.getGuestBook({
                  date: '',
                  userId: '',
                  collect: ''
                })
              }
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

    // 评论事件
    commentEvent () {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '评论中';
      guestCommentAdd({
        userId: this.workerId,
        userName: this.userName,
        guestId: item.id,
        system: 6,
        proId: this.proId,
        content: this.commentContent
      }).then((res) => {
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
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
  position: relative;
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
        .action-bar{
            padding: 10px 24px;
            box-sizing: border-box;
            display: flex;
            background: #fff;
            justify-content: space-between;
            align-items: center;
            .action-bar-left {

            }
        };
        .backlog-task-list-box {
          overflow: scroll;
          flex: 1;
          height: 100%;
          padding: 10px 10px 0 10px;
          box-sizing: border-box;
          position: relative;
          /deep/ .van-empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%)
          };
          .backlog-task-list {
              padding: 0 8px 4px 8px;
              box-sizing: border-box;
              border-radius: 6px;
              position: relative;
              background: #fff;
              box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.23);
              margin-bottom: 10px;
              .backlog-task-top {
                  height: 40px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  .bottom-border-1px(rgba(0, 0, 0, 0.23));
                  .backlog-task-top-left {
                      flex: 1;
                      font-size: 16px;
                      color: #000000;
                      .no-wrap()
                  };
                  .backlog-task-top-right {
                    font-size: 14px;
                    color: #3B9DF9
                  }
              };
              .backlog-task-content {
                padding-top: 10px;
                box-sizing: border-box;
                .message-content {
                    font-size: 14px;
                    color: #101010;
                    line-height: 20px;
                    word-break: break-all
                };
                .image-area {
                    margin: 10px 0;
                    width: 100%;
                    >img {
                        width: 31%;
                        height: 90px;
                        margin-right: 2%;
                        margin-bottom: 10px;
                        &:nth-child(3n+3) {
                            margin-right: 0
                        }
                    }
                };
                .message-line-one {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    .message-line-left {
                        span {
                            &:first-child {
                                font-size: 12px;
                                color: #1864FF;
                                margin-right: 6px
                            };
                            &:last-child {
                               font-size: 14px;
                               color: #E86F50 
                            }
                        }
                    };
                    .message-line-right {
                        >span {
                            &:first-child {
                                margin-right: 6px
                            };
                            display: inline-block;
                            font-size: 14px;
                            color: #101010;
                            img {
                                vertical-align: bottom;
                                width: 20px;
                                height: 20px;
                            }
                        }
                    }
                };
                .like-person {
                    margin: 10px 0;
                    span {
                        font-size: 14px;
                        color: #101010;
                    };
                    img {
                        vertical-align: bottom;
                        width: 20px;
                        margin-right: 6px;
                        height: 20px
                    }
                };
                .comment {
                    .comment-list {
                        margin-bottom: 6px;
                        .comment-top {
                            margin-bottom: 6px;
                            span {
                                &:first-child {
                                    font-size: 12px;
                                    color: #989999;
                                    margin-right: 6px
                                };
                                &:last-child {
                                    font-size: 12px;
                                    color: #E86F50 
                                }
                            }
                        };
                        .comment-bottom {
                            span {
                                font-size: 14px;
                                color: #000000 
                            }
                        }
                    }
                };
                .comment-input {
                    margin-top: 10px;
                    display: flex;
                    flex-wrap: wrap;
                    /deep/ .van-cell {
                        border-radius: 4px;
                        padding: 4px 6px !important;
                        background: #F9F9F9
                    }
                }
              }
          };
          .no-more-data {
              font-size: 12px;
              color: #BEC7D1;
              width: 100%;
              text-align: center;
              line-height: 30px
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
  };
  .comment-area {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 10px;
    background: #333;
    padding: 6px 4px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /deep/ .van-cell {
      border-radius: 4px;
      padding: 4px 6px !important;
      background: #101010;
      color: #fff;
      flex: 1;
      margin-right: 6px
    };
    /deep/ .van-cell::after {
      display: none
    };
    >span {
      display: inline-block;
      width: 56px;
      height: 33px;
      line-height: 33px;
      text-align: center;
      font-size: 14px;
      color: #fff;
      border-radius: 2px;
      background: #18B3EB;
    }
  }
}
</style>