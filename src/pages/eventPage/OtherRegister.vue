<template>
  <div class="page-box" ref="wrapper">
    <!-- 发现时间 -->
    <div class="find-time-box">
      <van-popup v-model="showFindTime" position="bottom">
        <van-datetime-picker
          v-model="currentFindTime"
          type="datetime"
          :min-date="minDate"
          :max-date="maxDate"
        >
          <template #default>
            <h3>发现时间</h3>
            <van-icon name="cross" size="25" @click="showFindTime = false" />
          </template>
          <template #columns-bottom>
            <div class="button-box">
              <span @click="showFindTime = false">取消</span>
              <span @click="onConDayFirm">确认</span>
            </div>
          </template>
        </van-datetime-picker>
      </van-popup>
    </div>
    <transition name="van-slide-up">
      <div class="choose-photo-box" v-show="photoBox">
        <div class="choose-photo">
          <van-icon name="photo" />
          <input name="uploadImg1" id="demo1" @change="previewFileOne" type="file" accept="image/album"/>从图库中选择
        </div>
        <div class="photo-graph">
          <van-icon name="photograph" />
          <input name="uploadImg2" id="demo2"  @change="previewFileTwo" type="file" accept="image/camera" apture="camera"/>拍照
        </div>
        <div class="photo-cancel" @click="photoCancel">取消</div>
      </div>
    </transition>
    <van-dialog v-model="deleteInfoDialogShow" title="确定删除此图片?" 
      confirm-button-color="#218FFF" show-cancel-button
      @confirm="sureDeleteEvent"
      >
    </van-dialog>
    <!-- 退出提示框   -->
    <div class="quit-info-box">
       <van-dialog v-model="quitInfoShow"  show-cancel-button width="85%"
          @confirm="quitSure" @cancel="quitCancel" confirm-button-text="退出"
          cancel-button-text="暂存"
        >
          <div class="delete-icon">
            <van-icon name="cross" size="24" @click="quitInfoShow = false" />
          </div>
          <div class="dialog-title">
            是否退出
          </div>
          <div class="dialog-center">
            退出后表单内容将清空,暂存还是退出?
          </div>
      </van-dialog>
    </div>
    <div class="img-dislog-box">
        <van-dialog v-model="imgBoxShow" width="98%" :close-on-click-overlay="true" confirm-button-text="关闭">
            <img :src="currentImgUrl" />
        </van-dialog> 
    </div>  
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{loadingText}}</van-loading>
    <van-overlay :show="overlayShow" z-index="100000" />
    <!-- 目的建筑 -->
    <div class="transport-rice-box" v-if="showStructure">
      <ScrollSelection :columns="structureOption" title="目的建筑" @sure="structureSureEvent" @cancel="structureCancelEvent" @close="structureCloseEvent" />
    </div>
    <!-- 目的科室 -->
    <div class="transport-rice-box" v-if="showGoalDepartment">
      <ScrollSelection :columns="goalDepartmentOption" title="目的科室" @sure="goalDepartmentSureEvent" @cancel="goalDepartmentCancelEvent" @close="goalDepartmentCloseEvent" />
    </div>
    <!-- 目的房间 -->
    <div class="transport-rice-box" v-if="showGoalSpaces">
      <ScrollSelection :columns="goalSpacesOption" title="目的房间" @sure="goalSpacesSureEvent" @cancel="goalSpacesCancelEvent" @close="goalSpacesCloseEvent" />
    </div>
    <div class="nav">
       <van-nav-bar
        title="事件记录"
        left-text="返回"
        :left-arrow="true"
        :placeholder="true"
        :border="false"
        :fixed="true"
        z-index="1000"
        :safe-area-inset-top="true"
        @click-left="onClickLeft"
    >
    </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
			<img :src="statusBackgroundPng" />
		</div>
      <div class="content-box">
        <div class="message-box">
         <div class="select-box event-type" v-if="enterEventRegisterPageMessage['patrolItemName'] != '' || registerType == 1">
            <div class="select-box-left">
              <span>*</span>
              <span>巡查项</span>
            </div>
            <div class="select-box-right event-type-right">
              <span>{{ itemName }}</span>
            </div>
        </div>
         <div class="select-box event-type">
            <div class="select-box-left">
              <span>*</span>
              <span>事件类型</span>
            </div>
            <div class="select-box-right">
              <span>{{ eventType }}</span>
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>建筑</span>
            </div>
            <div class="select-box-right" @click="enterEventRegisterPageMessage['patrolItemName'] != '' || registerType == 1 ? showStructure = false : showStructure = true">
              <span :class="{'spanStyle':enterEventRegisterPageMessage['patrolItemName'] != '' || registerType == 1}">{{ currentStructure }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>区域</span>
            </div>
            <div class="select-box-right" @click="goalDepartmentClickEvent">
              <span :class="{'spanStyle':enterEventRegisterPageMessage['patrolItemName'] != '' || registerType == 1}">{{ currentGoalDepartment }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>房间</span>
            </div>
            <div class="select-box-right" @click="goalSpacesClickEvent">
              <span>{{ currentGoalSpaces }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="details-site problem-overview">
            <div class="transport-type-left">
              <span>*</span>
              <span>详细地点</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="detailsSite"
                rows="1"
                maxlength="100"
                show-word-limit
                autosize
                type="textarea"
                placeholder="请输入"
              />
            </div>
          </div>
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>记录时间</span>
            </div>
            <div class="select-box-right" @click="showFindTime = true">
              <span>{{ getNowFormatDate(currentFindTime) }}</span>
              <van-icon name="arrow" color="#989999" size="20" />
            </div>
          </div>
          <div class="result-picture">
                <div>
                    <span>*</span>
                    <span>问题拍照</span>
                </div>
                <div class="image-list">
                    <div v-for="(item, index) in problemPicturesList" :key='index'>
                        <img :src="item" @click="enlareEvent(item)" />
                        <div class="icon-box" @click="issueDelete(index,item)">
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
          <div class="transport-type problem-overview">
            <div class="transport-type-left">
              <span>*</span>
              <span>情况说明</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="problemOverview"
                rows="1"
                autosize
                maxlength="200"
                show-word-limit
                type="textarea"
                placeholder="请输入问题描述"
              />
            </div>
          </div>
          <div class="transport-type">
            <div class="transport-type-left">
              <span>*</span>
              <span>备注</span>
            </div>
            <div class="transport-type-right">
              <van-field
                v-model="taskDescribe"
                rows="3"
                autosize
                type="textarea"
                placeholder="请输入备注"
              />
            </div>
          </div>
        </div>
        <div class="btn-box">
          <span class="operate-one" @click="quitEvent">退出</span>
          <span class="operate-two" @click="temporaryStorageEvent">暂存</span>
          <span class="operate-three" @click="repairsEvent">登记</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import {userSignOut,getAliyunSign} from '@/api/login.js'
import { eventregister, querySpace, queryDepartment, queryStructure} from '@/api/escortManagement.js'
import { setStore,removeAllLocalStorage,compress,deepClone, base64ImgtoFile } from '@/common/js/utils'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import ScrollSelection from "@/components/ScrollSelection";
import BottomSelect from "@/components/BottomSelect";
export default {
  name: "OtherRegister",
  components: {
    ScrollSelection,
    BottomSelect
  },
  mixins:[mixinsDeviceReturn],
  data() {
    return {
      loadingShow: false,
      quitInfoShow: false,
      registerType: null,
      itemName: '',
      eventType: '其他',
      showFindTime: false,
      problemPicturesList: [],
      minDate: new Date(2010, 0, 1),
      maxDate: new Date(2050, 10, 1),
      currentFindTime: new Date(),
      currentImgUrl: '',
      photoBox: false,
      imgBoxShow: false,
      imgIndex: '',
      imgOnlinePathArr: [],
      imgDeleteUrlArr: [],
      existOnlineImgPath: [],
      imgDeleteUrl: '',
      deleteInfoDialogShow: false,
      loadingText: '加载中...',
      problemOverview: '',
      detailsSite: '',
      taskDescribe: '',
      transportNumberValue: '',

      goalDepartmentOption: [],
      showGoalDepartment: false,
      currentGoalDepartment: '请选择',

      goalSpacesOption: [],
      showGoalSpaces: false,
      currentGoalSpaces: '请选择',


      structureOption: [],
      showStructure: false,
      currentStructure: '请选择',
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
    // 如果是从异常巡查项从处进来的，则回显区域名称
    if (this.enterEventRegisterPageMessage['patrolItemName'] != '') {
      this.currentGoalDepartment = this.enterEventRegisterPageMessage['depName'];
      this.itemName = this.enterEventRegisterPageMessage['patrolItemName']
    };
    this.parallelFunction()
  },

  beforeRouteEnter(to, from, next) {
    next(vm=>{
      if (from.path == '/eventList') {
        // 判断是否回显暂存数据
        let temporaryIndex = vm.temporaryStorageOtherRegisterMessage.findIndex((item) => { return item.id == vm.$route.query.eventId});
        if (temporaryIndex != -1) {
          vm.echoTemporaryStorageMessage(temporaryIndex)
        }
      }
	  });
    next() 
  },

  watch: {
  },

  computed: {
    ...mapGetters(["userInfo","transportantTaskMessage","ossMessage","departmentCheckList","timeMessage","enterProblemRecordMessage","temporaryStorageOtherRegisterMessage","enterEventRegisterPageMessage"]),
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
    ...mapMutations(["changeCatchComponent","changeOverDueWay","changeTimeMessage","changeOssMessage","changeDepartmentCheckList","changetransportTypeMessage","changeTemporaryStorageOtherRegisterMessage"]),

    onClickLeft() {
      this.$router.push({ path: "/eventList"})
    },

    // 任务开始事件弹框确认事件
     onConDayFirm() {
      this.showFindTime = false
    },

    // 图片放大事件
    enlareEvent (item) {
      this.currentImgUrl = item;
      this.imgBoxShow = true
    },

    // 拍照点击
    issueClickEvent () {
      if (this.problemPicturesList.length >= 5) {
        this.$toast('至多只能上传5张图片!');
        return
      };
      this.photoBox = true;
      this.overlayShow = true
    },

    // 确定删除提示框确定事件
    sureDeleteEvent () {
      this.imgDeleteUrlArr.push(this.imgDeleteUrl);
      this.problemPicturesList.splice(this.imgIndex, 1);
      for (let item of this.imgDeleteUrlArr) {
        let temporaryIndex = this.existOnlineImgPath.indexOf(item);
        if (temporaryIndex > -1) {
          this.existOnlineImgPath.splice(this.existOnlineImgPath.indexOf(item),1)
        }
      };
      console.log('sas1',this.problemPicturesList,this.existOnlineImgPath);
    },

    // 拍照照片删除
    issueDelete (index,item) {
      this.deleteInfoDialogShow = true;
      this.imgIndex = index;
      this.imgDeleteUrl = item
    },

    // 回显暂存的信息
    echoTemporaryStorageMessage (temporaryIndex) {
      let casuallyTemporaryStorageOtherRegisterMessage = this.temporaryStorageOtherRegisterMessage;
      this.currentFindTime = new Date(casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['createTime']);
      this.currentStructure = casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['structureName']  == '' ? '请选择' : casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['structureName'];
      this.currentGoalDepartment = casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['depName']  == '' ? '请选择' : casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['depName'];
      this.currentGoalSpaces = casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['roomName']  == '' ? '请选择' : casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['roomName'];
      this.detailsSite = casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['address'];
      this.problemOverview = casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['description'];
      this.taskDescribe = casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['remark'];
      this.problemPicturesList = casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['images'];
      this.registerType = casuallyTemporaryStorageClaimRegisterMessage[temporaryIndex]['registerType']
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
          console.log('当前图片',this.imgOnlinePathArr);
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


    // 图片上传预览
    previewFileOne() {
      let file = document.getElementById("demo1").files[0];
      this.temporaryFile = file;
      let _this = this;
      let reader = new FileReader();
      let isLt2M = file.size/1024/1024 < 16;
      if (!isLt2M) {
        this.$dialog.alert({
          message: '上传图片大小不能超过16MB!',
          closeOnPopstate: true
        }).then(() => {
        });
        return
      };  
      reader.addEventListener("load", function () {
        // 压缩图片
        let result = reader.result;
        let img = new Image();
        img.src = result;
        img.onload = function () {
          let src = compress(img);
          _this.problemPicturesList.push(src);
          _this.photoBox = false;
          _this.overlayShow = false
        }
      }, false);
      if (file) {
        reader.readAsDataURL(file);
      };
    },

    //拍照预览
    previewFileTwo() {
      let file = document.getElementById("demo2").files[0];
      let _this = this;
      let reader = new FileReader();
      let isLt2M = file.size/1024/1024 < 16;
      if (!isLt2M) {
        _this.$dialog.alert({
          message: '上传图片大小不能超过16MB!',
          closeOnPopstate: true
        }).then(() => {
        });
        return
      };  
      reader.addEventListener("load", function () {
        // 压缩图片
        let result = reader.result;
        let img = new Image();
        img.src = result;
        img.onload = function () {
          let src = compress(img);
          _this.problemPicturesList.push(src);
          _this.photoBox = false;
          _this.overlayShow = false
        }
      }, false);
      if (file) {
        reader.readAsDataURL(file);
      };
    },

    // 拍照取消
    photoCancel () {
      this.photoBox = false;
      this.overlayShow = false
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

   // 根据建筑查询科室信息
    getDepartmentByStructureId (structureId,flag,isInitial) {
      this.loadingText = '查询中...';
      this.loadingShow = true;
      this.overlayShow = true;
      this.goalDepartmentOption = [];
      queryDepartment({proId:this.proId,struId:structureId,permissions: 'patrol'})
      .then((res) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (res.data.data.length > 0) {
            for (let i = 0, len = res.data.data.length; i < len; i++) {
              this.goalDepartmentOption.push({
                text: res.data.data[i].name,
                value: res.data.data[i].id,
                id: i
              })
            };
            if (isInitial) {
              if (this.currentGoalDepartment != '请选择') {
                this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],false)
              }
            }  
          };
          if (flag) {
            this.showGoalDepartment = true
          }
        }
      })
      .catch((err) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        this.$dialog.alert({
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {})
      })
    },

    // 根据科室查询房间信息
    getSpacesByDepartmentId (depId,struId,flag) {
      this.loadingText = '查询中...';
      this.loadingShow = true;
      this.overlayShow = true;
      this.goalSpacesOption = [];
      querySpace({hospitalId:this.proId,struId: struId, depId:depId})
      .then((res) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (res.data.data.length > 0) {
            for (let i = 0, len = res.data.data.length; i < len; i++) {
              this.goalSpacesOption.push({
                text: res.data.data[i].name,
                value: res.data.data[i].id,
                id: i
              })
            }
          };
          if (flag) {this.showGoalSpaces = true}
        }
      })
      .catch((err) => {
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        this.$dialog.alert({
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {})
      })
    },

    // 并行查询目的建筑
    parallelFunction (type) {
        this.loadingText = '加载中...';
        this.loadingShow = true;
        this.overlayShow = true;
        Promise.all([this.getStructure()])
        .then((res) => {
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          if (res && res.length > 0) {
            this.structureOption = [];
            let [item1] = res;
            if (item1) {
              // 目的建筑
              for (let i = 0, len = item1.length; i < len; i++) {
                this.structureOption.push({
                  text: item1[i].name,
                  value: item1[i].id,
                  id: i
                })
              };
              // 如果是从异常巡查项从处进来的，则回显建筑名称
              if (this.enterEventRegisterPageMessage['patrolItemName'] != '') {
                this.currentStructure = this.structureOption.filter((innerItem) => { return innerItem.value == this.enterEventRegisterPageMessage['structId']})[0]['text']
              };
              if (this.currentStructure != '请选择') {
                if (this.enterEventRegisterPageMessage['patrolItemName'] == '' || this.registerType == 2) {
                  this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],false,true)
                } else {
                  this.getDepartmentByStructureId('',false,true)
                }
              }
            }
          }
        })
        .catch((err) => {
          this.loadingText = '';
          this.loadingShow = false;
          this.overlayShow = false;
          this.$dialog.alert({
            message: `${err}`,
            closeOnPopstate: true
          }).then(() => {})
        })
      },


      // 查询目的建筑
      getStructure () {
        return new Promise((resolve,reject) => {
          queryStructure(this.proId).then((res) => {
            if (res && res.data.code == 200) {
              resolve(res.data.data)
            }
          })
          .catch((err) => {
            reject(err.message)
          })
        })
      },

    // 目的建筑下拉选择框确认事件
    structureSureEvent (val) {
      if (val) {
        this.currentStructure =  val;
        this.currentGoalDepartment = '请选择';
        this.currentGoalSpaces = '请选择';
        this.goalSpacesOption = [];
        this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],false,false)
      } else {
        this.currentStructure = '请选择'
      };
      this.showStructure = false
    },

    // 目的建筑下拉选择框取消事件
    structureCancelEvent () {
      this.showStructure = false
    },

    // 目的建筑下拉选择框关闭事件
    structureCloseEvent () {
      this.showStructure = false
    },

    // 目的科室下拉选择框确认事件
    goalDepartmentSureEvent (val) {
      if (val) {
        this.currentGoalDepartment =  val;
        this.currentGoalSpaces = '请选择';
        this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],false)
      } else {
        this.currentGoalDepartment = '请选择'
      };
      this.showGoalDepartment = false
    },

    // 目的科室列点击事件
    goalDepartmentClickEvent () {
      if (this.enterEventRegisterPageMessage['patrolItemName'] != '' || this.registerType == 1) {return};
      if (this.currentStructure == '请选择') {
        this.$toast('请选择建筑')
      } else {
        this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],true,false)
      }
    },

    // 目的科室下拉选择框取消事件
    goalDepartmentCancelEvent () {
      this.showGoalDepartment = false
    },

    // 目的科室下拉选择框关闭事件
    goalDepartmentCloseEvent () {
      this.showGoalDepartment = false
    },

    // 目的房间下拉选择框关闭事件
    goalSpacesCloseEvent () {
      this.showGoalSpaces = false
    },
    
    // 目的房间列点击事件
    goalSpacesClickEvent () {
      if (this.currentGoalDepartment == '请选择') {
        this.$toast('请选择科室')
      } else {
        try {
          this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],true)
        } catch (err) {
          this.$toast(`${err}`)
        }
      }
    },

    // 目的房间下拉选择框确认事件
    goalSpacesSureEvent (val) {
      if (val.length > 0) {
        this.currentGoalSpaces =  val;
      } else {
        this.currentGoalSpaces = '请选择'
      };
      this.showGoalSpaces = false
    },

    // 目的房间下拉选择框取消事件
    goalSpacesCancelEvent () {
      this.showGoalSpaces = false
    },

      // 下班签退事件
      signOutEvent () {
          this.$dialog.alert({
            message: '确定签退?',
            closeOnPopstate: true,
            showCancelButton: true
          }).then(() => {
            this.userLoginOut(this.proId, this.userInfo.userName)
          })
          .catch(() => {
          })
      },

      // 用户签退
      userLoginOut (proId,workerId) {
        this.changeOverDueWay(true);
        setStore('storeOverDueWay',true);
        userSignOut(proId,workerId).then((res) => {
          if (res && res.data.code == 200) {
            removeAllLocalStorage();
            this.changeCatchComponent([]);
            this.$router.push({path:'/'})
          } else {
            this.$dialog.alert({
              message: `${res.data.msg}`,
              closeOnPopstate: true
            }).then(() => {
            });
            this.changeOverDueWay(false);
            setStore('storeOverDueWay',false);
          }
        }).
        catch((err) => {
          this.changeOverDueWay(false);
          setStore('storeOverDueWay',false);
          this.$dialog.alert({
            message: `${err.message}`,
            closeOnPopstate: true
          }).then(() => {
          });
        })
      },

    // 退出事件
    quitEvent () {
      this.quitInfoShow = true
    },

    // 事件类型转换
    eventTypeTransform (text) {
      switch(text) {
        case '工程报修' :
          return 1
          break;
        case '拾金不昧' :
          return 2
          break;
        case '其他' :
          return 3
          break;
      }
    },

    // 登记类型转换
    registerTypeTransform (text) {
      switch(text) {
        case '巡查' :
          return 1
          break;
        case '其他' :
          return 2
          break
      }
    },

    // 登记其他事件
    async repairsEvent () {
      if (!this.eventType) {
        this.$toast('事件类型不能为空');
        return
      };
      if (this.currentStructure == '请选择') {
        this.$toast('建筑不能为空');
        return
      };
      if (this.currentGoalDepartment == '请选择') {
        this.$toast('区域不能为空');
        return
      };
      if (this.currentGoalSpaces == '请选择') {
        this.$toast('房间不能为空');
        return
      };
      if (!this.detailsSite) {
        this.$toast('详细地点不能为空');
        return
      };
      if (!this.currentFindTime) {
        this.$toast('记录时间不能为空');
        return
      };
      if (this.problemPicturesList.length == 0) {
        this.$toast('问题拍照图片不能为空');
        return
      };
      if (!this.problemOverview) {
        this.$toast('情况说明不能为空');
        return
      };
      if (!this.taskDescribe) {
        this.$toast('备注不能为空');
        return
      };
      // 上传图片到阿里云服务器
      let temporaryProblemPicturesList = this.problemPicturesList.filter((item) => { return item.indexOf('https://') == -1});
      this.loadText ='提交中';
      this.overlayShow = true;
      this.loadingShow = true;
      for (let imgI of temporaryProblemPicturesList) {
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
      // 创建其他任务
      let temporaryMessage = {
        eventType: this.eventTypeTransform(this.enterEventRegisterPageMessage['eventType']),
        registerType: this.registerTypeTransform(this.enterEventRegisterPageMessage['registerType']),
        checkResultId: this.enterEventRegisterPageMessage['resultId'],
        findTime: this.getNowFormatDate(this.currentFindTime),
        structureId: this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],
        structureName: this.currentStructure,
        depId: this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],
        depName: this.currentGoalDepartment,
        roomId: this.goalSpacesOption.filter((item) => { return item['text'] == this.currentGoalSpaces})[0]['value'],
        roomName: this.currentGoalSpaces,
        address: this.detailsSite,
        description: this.problemOverview,
        remark: this.taskDescribe,
        images: this.imgOnlinePathArr,
        system: 6,
        proId: this.proId,
        createName: this.userName,
        createTime: this.getNowFormatDate(new Date()),
        createId: this.workerId
      };
      this.postGenerateRepairsTask(temporaryMessage)
    },

    // 生成其他任务
    postGenerateRepairsTask (data) {
      this.loadingText = '创建中...';
      this.loadingShow = true;
      this.overlayShow = true;
      eventregister(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$toast(`${res.data.msg}`);
          // 更改该检查项下是否有登记的事件(从异常巡查项处进入该页面创建)
          if (this.enterEventRegisterPageMessage['patrolItemName']) {
            let tempraryMessage = this.departmentCheckList;
            tempraryMessage['checkItemList'][this.enterProblemRecordMessage[index]]['isHaveEventRegister'] = 1;
            this.changeDepartmentCheckList(tempraryMessage)
          };
          //登记成功后清除该列表暂存信息
          let casuallyTemporaryStorageOtherRegisterMessage = this.temporaryStorageOtherRegisterMessage.filter((item) => { return item.id != this.$route.query.eventId});
          this.changeTemporaryStorageOtherRegisterMessage(casuallyTemporaryStorageOtherRegisterMessage)
          this.$router.push({path:'/eventList'})
        } else {
          this.imgOnlinePathArr = [];
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
        this.imgOnlinePathArr = [];
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

    // 确定退出
    quitSure () {
      this.$router.push({ path: "/eventList"})
    },

    // 取消退出(暂存)
    quitCancel () {
      this.temporaryStorageEvent()
    },

    // 暂存事件
    temporaryStorageEvent () {
      let casuallyTemporaryStorageOtherRegisterMessage = this.temporaryStorageOtherRegisterMessage;
      if (this.temporaryStorageOtherRegisterMessage.length > 0 ) {
          let temporaryIndex = this.temporaryStorageOtherRegisterMessage.findIndex((item) => { return item.id == this.$route.query.eventId});
          if (temporaryIndex != -1) {
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['createTime'] = this.getNowFormatDate(this.currentFindTime);
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['roomName'] = this.currentGoalSpaces == '请选择' ? '' : this.currentGoalSpaces;
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['address'] = this.detailsSite;
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['description'] = this.problemOverview;
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['remark'] = this.taskDescribe;
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['images'] = this.problemPicturesList;
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['structureName'] = this.currentStructure == '请选择' ? '' : this.currentStructure;
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['depName'] = this.currentGoalDepartment == '请选择' ? '' : this.currentGoalDepartment;
            casuallyTemporaryStorageOtherRegisterMessage[temporaryIndex]['roomName'] = this.currentGoalSpaces == '请选择' ? '' : this.currentGoalSpaces
          } else {
            casuallyTemporaryStorageOtherRegisterMessage.push({
              id: uuidv4(),
              eventType: this.eventTypeTransform(this.eventType),
              registerType: this.registerTypeTransform(this.enterEventRegisterPageMessage['registerType']),
              createTime: this.getNowFormatDate(this.currentFindTime),
              createName: this.userName,
              structureName: this.currentStructure == '请选择' ? '' : this.currentStructure,
              depName: this.currentGoalDepartment == '请选择' ? '' : this.currentGoalDepartment,
              roomName: this.currentGoalSpaces == '请选择' ? '' : this.currentGoalSpaces,
              address: this.detailsSite,
              description: this.problemOverview,
              remark: this.taskDescribe,
              images: this.problemPicturesList,
              state: -1,
              itemName: this.enterEventRegisterPageMessage['patrolItemName']
            })
          }
        } else {
          casuallyTemporaryStorageOtherRegisterMessage.push({
            id: uuidv4(),
            eventType: this.eventTypeTransform(this.eventType),
            registerType: this.registerTypeTransform(this.enterEventRegisterPageMessage['registerType']),
            createTime: this.getNowFormatDate(this.currentFindTime),
            createName: this.userName,
            structureName: this.currentStructure == '请选择' ? '' : this.currentStructure,
            depName: this.currentGoalDepartment == '请选择' ? '' : this.currentGoalDepartment,
            roomName: this.currentGoalSpaces == '请选择' ? '' : this.currentGoalSpaces,
            address: this.detailsSite,
            description: this.problemOverview,
            remark: this.taskDescribe,
            images: this.problemPicturesList,
            state: -1,
            itemName: this.enterEventRegisterPageMessage['patrolItemName']
          })
      };
      this.changeTemporaryStorageOtherRegisterMessage(casuallyTemporaryStorageOtherRegisterMessage);
      this.$toast('暂存成功');
      console.log('暂存的其它数据',this.temporaryStorageOtherRegisterMessage);
      this.$router.push({path: '/eventList'})
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
            text-align: center;
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
  .choose-photo-box {
    position: fixed;
    margin: auto;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 200000;
    font-size: 0;
    > div {
      width: 100%;
      text-align: center;
      font-size: 16px;
      background: #f6f6f6
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
        line-height: 30px
      };
      input {
        position: absolute;
        font-size: 100px;
        right: 0;
        top: 0;
        height: 100%;
        opacity: 0;
        filter: alpha(opacity=0);
        cursor: pointer
      }
    };
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
        line-height: 50px
      };
      input {
        position: absolute;
        font-size: 100px;
        right: 0;
        height: 100%;
        top: 0;
        opacity: 0;
      }
    };
    .photo-cancel {
      position: relative;
      display: inline-block;
      padding: 8px 12px;
      overflow: hidden;
      color: @color-theme;
      text-decoration: none;
      text-indent: 0;
      line-height: 30px;
      font-weight: bold
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
                font-weight: bold !important
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
              .spanStyle {
                color: #bfbfbf !important
              };
              >span {
                color: #101010;
                text-align: right;
                flex: 1;
                .no-wrap()
              }
            }
          };
          .end-select-box {
              .select-box-right {
                padding-right: 0 !important;
                .spanStyle {
                  color: #bfbfbf !important
                };
              }
          };
          .problem-overview {
            align-items: center
          };
          .details-site {
            width: 100%;
            padding: 10px 6px;
            box-sizing: border-box;
            background: #fff;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-top: 6px;
            .transport-type-left {
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
              margin-bottom: 8px;
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
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
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
              color: #E86F50;
              border: 1px solid #E86F50;
              margin-right: 30px
            };
            &:nth-child(2) {
              color: #3B9DF9;
              border: 1px solid #3B9DF9;
              margin-right: 30px
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
}
</style>