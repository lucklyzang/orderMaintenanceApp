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
    <!-- 删除提示框   -->
    <div class="quit-info-box">
       <van-dialog v-model="quitInfoShow"  show-cancel-button width="85%"
          @confirm="deleteSure" @cancel="deleteCancel" confirm-button-text="取消"
          cancel-button-text="确定"
        >
          <div class="dialog-title">
            <img :src="exclamationPointPng">
          </div>
          <div class="dialog-top">
            您确定要删除该事件？
          </div>
          <div class="dialog-center">
            删除事件后,所有节点的内容将无法再被查询或恢复。
          </div>
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
          <div v-for="(item,index) in stepData" :key="index" @click="stepClickEvent(item,index)">
            <span :class="{'checkSpanStyle': checkedStepIndex == index,'completeSpanStyle': index <= currentStepIndex}">{{ item.stepName }}</span>
            <img :src="index <= currentStepIndex ? stepActivePng : stepStaticPng" alt="" v-show="index != 3">
          </div>
        </div>
        <div class="message-box-one" v-if="checkedStepIndex == 0">
         <div class="select-box-one">
            <div class="select-box-left">
              <span>事件类型</span>
            </div>
            <div class="select-box-right">
              <span>{{ eventTypeTransform(eventType) }}</span>
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
              <span>{{ currentGoalSpaces }}</span>
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
              <span>{{ currentFindTime }}</span>
            </div>
          </div>
          <div class="transport-type">
            <div class="transport-type-left">
              <span>拾得内容</span>
            </div>
            <div class="transport-type-right">
             {{ problemOverview }}
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
        <div class="message-box" v-if="checkedStepIndex == 1">
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>交接时间</span>
            </div>
            <div class="select-box-right" @click="checkedStepIndex <= currentStepIndex ? showHandoverTime = false : showHandoverTime = true">
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
                :disabled="checkedStepIndex <= currentStepIndex"
                maxlength="100"
                show-word-limit
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
            <div class="signature-right" @click="connectSignatureEvent('交接')">
              <span v-if="!claimRegisterElectronicSignatureMessage.connectSignature && !connectSignature" class="span-one">请签字</span>
              <span v-else class="span-two">
                <img :src="claimRegisterElectronicSignatureMessage.connectSignature || connectSignature" alt="">
              </span>
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-left">
              <span>*</span>
              <span>保管人签字</span>
            </div>
            <div class="signature-right" @click="connectSignatureEvent('保管')">
              <span v-if="!claimRegisterElectronicSignatureMessage.keeperSignature && !keeperSignature" class="span-one">请签字</span>
              <span v-else class="span-two">
                <img :src="claimRegisterElectronicSignatureMessage.keeperSignature || keeperSignature" alt="">
              </span>
            </div>
          </div>
        </div>
        <div class="message-box" v-if="checkedStepIndex == 2">
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>联系时间</span>
            </div>
            <div class="select-box-right" @click="checkedStepIndex <= currentStepIndex ? showRelationTime = false : showRelationTime = true">
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
                :disabled="checkedStepIndex <= currentStepIndex"
                maxlength="100"
                show-word-limit
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
                :disabled="checkedStepIndex <= currentStepIndex"
                maxlength="100"
                show-word-limit
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
                :disabled="checkedStepIndex <= currentStepIndex"
                maxlength="500"
                show-word-limit
                autosize
                type="textarea"
                placeholder="可联系失主,告知联系电话"
              />
            </div>
          </div>
        </div>
        <div class="message-box" v-if="checkedStepIndex == 3">
          <div class="select-box end-select-box">
            <div class="select-box-left">
              <span>*</span>
              <span>领取时间</span>
            </div>
            <div class="select-box-right" @click="checkedStepIndex <= currentStepIndex ? showGetTime = false : showGetTime = true">
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
                :disabled="checkedStepIndex <= currentStepIndex"
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
                  :disabled="checkedStepIndex <= currentStepIndex"
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
                  :disabled="checkedStepIndex <= currentStepIndex"
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
                  :disabled="checkedStepIndex <= currentStepIndex"
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
              <div class="signature-right" @click="connectSignatureEvent('领取',index)">
                <span class="span-one" v-if="!item.getPersonSignature">请签字</span>
                <span class="span-two" v-else>
                  <img :src="item.getPersonSignature" alt="">
                </span>
              </div>
            </div>
            <img :src="addIconPng" alt="" @click="addLinkmanMessage" v-if="index == 0 && checkedStepIndex > currentStepIndex">
            <img :src="subtractIconPng" alt="" @click="subtractLinkmanMessage(index)" v-if="index != 0 && checkedStepIndex > currentStepIndex">
          </div>
        </div>
        <div class="btn-box" v-if="checkedStepIndex <= currentStepIndex">
          <span class="operate-two" @click="closeEvent">关闭</span>
          <span class="operate-three" @click="quitInfoShow = true">
            <van-icon name="delete" color="#fff" size="25" />
          </span>
        </div>
        <div class="btn-box-other" v-else>
          <span class="operate-one" @click="quitInfoShow = true">
            <van-icon name="delete" color="#fff" size="25" />
          </span>
         <span class="operate-two" @click="temporaryStorageEvent">
            暂存
          </span>
          <span class="operate-three" @click="repairsEvent">
            提交
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction'
import { eventDelete, getEventDetails,eventHandover, eventContact, eventReceive } from '@/api/escortManagement.js'
import _ from 'lodash'
import axios from 'axios'
import { base64ImgtoFile } from '@/common/js/utils'
import {getAliyunSign} from '@/api/login.js'
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
      currentStepIndex: 0,
      checkedStepIndex: 0,
      loadingShow: false,
      eventId: '',
      quitInfoShow: false,
      eventType: '',
      problemPicturesList: [require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png"),require("@/common/images/home/status-background.png")],
      currentImgUrl: '',
      photoBox: false,
      imgBoxShow: false,
      minDate: new Date(2010, 0, 1),
      maxDate: new Date(2050, 10, 1),
      imgIndex: '',
      loadingText: '加载中...',
      detailsSite: '',
      taskDescribe: '',
      problemOverview: '',
      transportNumberValue: '',
      currentFindTime: '',
      imgOnlinePathArr: [],
      linkmanImgOnlinePathArr: [],
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
      exclamationPointPng: require("@/common/images/home/exclamation-point.png"),
      subtractIconPng: require("@/common/images/home/subtract-icon.png")
    }
  },

  mounted() {
    console.log('回显数据',this.temporaryStorageHistoryClaimRegisterMessage);
    // 控制设备物理返回按键
    if (!IsPC()) {
      let that = this;
      pushHistory();
      that.gotoURL(() => {
        pushHistory();
        //清除拾金不昧签名相关信息
        this.changeClaimRegisterElectronicSignatureMessage({receiverSignature:[]});
        if (that.enterEventRegisterPageMessage['enterRegisterEventPageSource']) {
          that.$router.push({path: that.enterEventRegisterPageMessage['enterRegisterEventPageSource']})
        } else {
          that.$router.push({path: '/eventList'})
        }
      })
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm=>{
      if (from.path != '/eventRegisterElectronicSignaturePage' && from.path != '/moreHistoryClaimRegister') {
        vm.queryEventDetails(vm.$route.query.eventId,false)
      } else {
        vm.queryEventDetails(vm.claimRegisterElectronicSignatureMessage.eventId,true)
      };
	});
    next() 
  },

  watch: {
  },

  computed: {
    ...mapGetters(["userInfo","transportantTaskMessage","ossMessage","enterEventRegisterPageMessage","timeMessage","claimRegisterElectronicSignatureMessage","temporaryStorageHistoryClaimRegisterMessage","moreEventMessage"]),
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
    ...mapMutations(["changeCatchComponent","changeOverDueWay","changeTimeMessage","changeOssMessage","changeClaimRegisterElectronicSignatureMessage","changetransportTypeMessage","changeTemporaryStorageHistoryClaimRegisterMessage","changeMoreEventMessage"]),

    onClickLeft() {
      //清除拾金不昧签名相关信息
      this.changeClaimRegisterElectronicSignatureMessage({receiverSignature:[]});
      if (this.enterEventRegisterPageMessage['enterRegisterEventPageSource']) {
        this.$router.push({path: this.enterEventRegisterPageMessage['enterRegisterEventPageSource']})
      } else {
        this.$router.push({path: '/eventList'})
      }
    },

    onClickRight() {
      let temporaryClaimRegisterElectronicSignatureMessage = this.claimRegisterElectronicSignatureMessage;
      temporaryClaimRegisterElectronicSignatureMessage['checkedStepIndex'] = this.checkedStepIndex;
      temporaryClaimRegisterElectronicSignatureMessage['eventId'] = this.eventId;
      // 交接信息
      // if (this.checkedStepIndex == 1) {
        temporaryClaimRegisterElectronicSignatureMessage['handoverTime'] = new Date(this.handoverTime);
        temporaryClaimRegisterElectronicSignatureMessage['connectSite'] = this.connectSite;
      // 联系信息
      // } else if (this.checkedStepIndex == 2) {
        temporaryClaimRegisterElectronicSignatureMessage['relationTime'] = new Date(this.relationTime);
        temporaryClaimRegisterElectronicSignatureMessage['contactDepartment'] = this.contactDepartment;
        temporaryClaimRegisterElectronicSignatureMessage['linkman'] = this.linkman;
        temporaryClaimRegisterElectronicSignatureMessage['contactInformation'] = this.contactInformation
      // } else if (this.checkedStepIndex == 3) {
        // 领取信息
        temporaryClaimRegisterElectronicSignatureMessage['getTime'] = new Date(this.getTime);
        temporaryClaimRegisterElectronicSignatureMessage['getSite'] = this.getSite;
        temporaryClaimRegisterElectronicSignatureMessage['getMessage'] = this.getMessage
      // }
      this.changeClaimRegisterElectronicSignatureMessage(temporaryClaimRegisterElectronicSignatureMessage);
      this.$router.push({ path: "/moreHistoryClaimRegister"})
    },

    // 顶部流程点击事件
    stepClickEvent (item,index) {
      // 当前流程未保存成功时，不能点击进入到下一流程
      if (index > this.currentStepIndex + 1) {
        return
      };
      this.checkedStepIndex = index;
      console.log('当前环节',this.checkedStepIndex)
    },

    // 删除确定
    deleteSure () {
    },

    // 删除取消
    deleteCancel () {
      this.deleteEvent()
    },

    // 删除事件
    deleteEvent () {
      this.loadingText = '删除中...';
      this.loadingShow = true;
      this.overlayShow = true;
      eventDelete(this.eventId).then((res) => {
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
      this.getMessage.splice(index,1);
      // 删除该联系人中对应的签名base64字符串
      let temporaryClaimRegisterElectronicSignatureMessage = this.claimRegisterElectronicSignatureMessage;
      temporaryClaimRegisterElectronicSignatureMessage['receiverSignature'] = temporaryClaimRegisterElectronicSignatureMessage['receiverSignature'].filter((item) => { return item['eventIndex'] != index});
      this.changeClaimRegisterElectronicSignatureMessage(temporaryClaimRegisterElectronicSignatureMessage);
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

    // 交接环节签字事件
    connectSignatureEvent (text,index = '') {
      // 已经保存的表单不允许签字
      if (this.checkedStepIndex <= this.currentStepIndex) { return };
      let temporaryClaimRegisterElectronicSignatureMessage = this.claimRegisterElectronicSignatureMessage;
      temporaryClaimRegisterElectronicSignatureMessage['step'] = text;
      temporaryClaimRegisterElectronicSignatureMessage['checkedStepIndex'] = this.checkedStepIndex;
      if (text == '交接' || text == '保管') {
        temporaryClaimRegisterElectronicSignatureMessage['handoverTime'] = new Date(this.handoverTime);
        temporaryClaimRegisterElectronicSignatureMessage['connectSite'] = this.connectSite
      } else if (text == '领取') {
        temporaryClaimRegisterElectronicSignatureMessage['getTime'] = new Date(this.getTime);
        temporaryClaimRegisterElectronicSignatureMessage['getSite'] = this.getSite;
        temporaryClaimRegisterElectronicSignatureMessage['receiverIndex'] = index;
        temporaryClaimRegisterElectronicSignatureMessage['getMessage'] = this.getMessage
      };  
      temporaryClaimRegisterElectronicSignatureMessage['eventId'] = this.$route.query.eventId ? this.$route.query.eventId : temporaryClaimRegisterElectronicSignatureMessage['eventId'];
      this.changeClaimRegisterElectronicSignatureMessage(temporaryClaimRegisterElectronicSignatureMessage);
      this.$router.push({path: '/eventRegisterElectronicSignaturePage'})
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
      //清除拾金不昧签名相关信息
      this.changeClaimRegisterElectronicSignatureMessage({receiverSignature:[]});
      if (this.enterEventRegisterPageMessage['enterRegisterEventPageSource']) {
        this.$router.push({path: this.enterEventRegisterPageMessage['enterRegisterEventPageSource']})
      } else {
        this.$router.push({path: '/eventList'})
      }
    },

    // 事件类型转换
    eventTypeTransform (text) {
      switch(text) {
        case 1 :
          return '工程报修'
          break;
        case 2 :
          return '拾金不昧'
          break;
        case 3 :
          return '其他'
          break;
      }
    },

    // 回显暂存的信息
    async echoTemporaryStorageMessage (temporaryIndex) {
      console.log('回显数据',this.temporaryStorageHistoryClaimRegisterMessage);
      let casuallyTemporaryStorageHistoryClaimRegisterMessage = _.cloneDeep(this.temporaryStorageHistoryClaimRegisterMessage);
      if (this.checkedStepIndex == 1) {
        this.handoverTime = new Date(casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['handoverTime']);
        this.connectSite = casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['connectSite'];
        this.connectSignature = casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['connectSignature'];
        this.keeperSignature = casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['keeperSignature']
      } else if (this.checkedStepIndex == 2) {
        this.relationTime = new Date(casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['relationTime']);
        this.contactDepartment = casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['contactDepartment'];
        this.linkman = casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['linkman'];
        this.contactInformation = casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['contactInformation']
      } else if (this.checkedStepIndex == 3) {
        this.getTime = new Date(casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['getTime']);
        this.getSite = casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['getSite'];
        this.getMessage = casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['getMessage']
      }
    },

    // 查询事件详情
    queryEventDetails (id,flag) {
      // flag true: 从签名页和更多信息页进入 false: 从事件列表页进入
      this.loadingText = '加载中...';
      this.loadingShow = true;
      this.overlayShow = true;
      getEventDetails(id).then((res) => {
        if (res && res.data.code == 200) {
          this.changeMoreEventMessage(res.data.data);
          this.currentStepIndex = res.data.data['state'];
          this.checkedStepIndex = res.data.data['state'];
          this.eventId = res.data.data['id'];
          if (this.currentStepIndex == 0) {
            // 展示登记信息
            this.eventType = res.data.data['eventType'];
            this.currentStructure = res.data.data['structureName'];
            this.currentGoalDepartment = res.data.data['depName'];
            this.currentGoalSpaces = res.data.data['roomName'];
            this.detailsSite = res.data.data['address'];
            this.currentFindTime = res.data.data['findTime'];
            this.problemPicturesList = res.data.data['images'];
            this.problemOverview = res.data.data['description'];
            this.taskDescribe = res.data.data['remark'];
            // 回显进入签名页和更多信息页之前的交接时间和交接地点信息
            if (flag) {
              // 回显交接信息
              this.handoverTime = this.claimRegisterElectronicSignatureMessage['handoverTime'];
              this.connectSite = this.claimRegisterElectronicSignatureMessage['connectSite']
            }  
          } else if (this.currentStepIndex == 1) {
            // 展示登记信息
            this.eventType = res.data.data['eventType'];
            this.currentStructure = res.data.data['structureName'];
            this.currentGoalDepartment = res.data.data['depName'];
            this.currentGoalSpaces = res.data.data['roomName'];
            this.detailsSite = res.data.data['address'];
            this.currentFindTime = res.data.data['findTime'];
            this.problemPicturesList = res.data.data['images'];
            this.problemOverview = res.data.data['description'];
            this.taskDescribe = res.data.data['remark'];
            // 展示交接信息
            this.handoverTime = new Date(res.data.data['extendData']['handover']['time']);
            this.connectSite = res.data.data['extendData']['handover']['address'];
            this.connectSignature = res.data.data['extendData']['handover']['from'];
            this.keeperSignature =  res.data.data['extendData']['handover']['to'];
            // 回显进入签名页和更多信息页之前的联系信息
            if (flag) {
              this.relationTime = this.claimRegisterElectronicSignatureMessage['relationTime'];
              this.contactDepartment = this.claimRegisterElectronicSignatureMessage['contactDepartment'];
              this.linkman = this.claimRegisterElectronicSignatureMessage['linkman'];
              this.contactInformation = this.claimRegisterElectronicSignatureMessage['contactInformation']
            }
          } else if (this.currentStepIndex == 2) {
            // 展示登记信息
            this.eventType = res.data.data['eventType'];
            this.currentStructure = res.data.data['structureName'];
            this.currentGoalDepartment = res.data.data['depName'];
            this.currentGoalSpaces = res.data.data['roomName'];
            this.detailsSite = res.data.data['address'];
            this.currentFindTime = res.data.data['findTime'];
            this.problemPicturesList = res.data.data['images'];
            this.problemOverview = res.data.data['description'];
            this.taskDescribe = res.data.data['remark'];
            // 展示交接信息
            this.handoverTime = new Date(res.data.data['extendData']['handover']['time']);
            this.connectSite = res.data.data['extendData']['handover']['address'];
            this.connectSignature = res.data.data['extendData']['handover']['from'];
            this.keeperSignature =  res.data.data['extendData']['handover']['to'];

            // 展示联系信息
            this.relationTime = new Date(res.data.data['extendData']['contact']['time']);
            this.contactDepartment = res.data.data['extendData']['contact']['department'];
            this.linkman = res.data.data['extendData']['contact']['name'];
            this.contactInformation = res.data.data['extendData']['contact']['situation'];
            // 回显进入签名页和更多信息页之前领取的相关信息
            if (flag) {
              this.getTime = this.claimRegisterElectronicSignatureMessage['getTime'];
              this.getSite = this.claimRegisterElectronicSignatureMessage['getSite'];
              this.getMessage = this.claimRegisterElectronicSignatureMessage['getMessage'];
              // 将领取人签名base64字符串赋予对应的领取人信息里的签名字段
              for (let i = 0, len = this.getMessage.length; i < len; i++) {
                let temporaryItem = this.claimRegisterElectronicSignatureMessage['receiverSignature'].filter((item) => { return item.eventIndex == i})[0];
                if (temporaryItem) {
                  this.getMessage[i]['getPersonSignature'] = temporaryItem['signature']
                }
              }
            }
          } else if (this.currentStepIndex == 3) {
            // 展示登记信息
            this.eventType = res.data.data['eventType'];
            this.currentStructure = res.data.data['structureName'];
            this.currentGoalDepartment = res.data.data['depName'];
            this.currentGoalSpaces = res.data.data['roomName'];
            this.detailsSite = res.data.data['address'];
            this.currentFindTime = res.data.data['findTime'];
            this.problemPicturesList = res.data.data['images'];
            this.problemOverview = res.data.data['description'];
            this.taskDescribe = res.data.data['remark'];
            // 展示交接信息
            this.handoverTime = new Date(res.data.data['extendData']['handover']['time']);
            this.connectSite = res.data.data['extendData']['handover']['address'];
            this.connectSignature = res.data.data['extendData']['handover']['from'];
            this.keeperSignature =  res.data.data['extendData']['handover']['to'];
            
            // 展示联系信息
            this.relationTime = new Date(res.data.data['extendData']['contact']['time']);
            this.contactDepartment = res.data.data['extendData']['contact']['department'];
            this.linkman = res.data.data['extendData']['contact']['name'];
            this.contactInformation = res.data.data['extendData']['contact']['situation'];

            // 展示领取信息
            this.getMessage = [];
            this.getTime = new Date(res.data.data['extendData']['receive']['time']);
            this.getSite = res.data.data['extendData']['receive']['address'];
            for (let item of res.data.data['extendData']['receive']['people']) {
              if (res.data.data['extendData']['receive']['people'].length > 0) {
                this.getMessage.push({
                  finalLinkman: item['name'],
                  getPersonIdNumber: item['cardNo'],
                  getContentDescribe: item['content'],
                  getPersonSignature: item['sign']
                })
              }
            }
          };
          // 判断是否回显暂存数据
          let temporaryIndex = this.temporaryStorageHistoryClaimRegisterMessage.findIndex((item) => { return item.id == this.eventId});
          if (temporaryIndex != -1) {
            if (!flag) {
              // 当前实际流程大于暂存信息里的流程时则以当前实际流程为准
              if (this.checkedStepIndex <= this.temporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['checkedStepIndex']) {
                this.checkedStepIndex = this.temporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['checkedStepIndex'];
              };
              // 已提交的步骤,再次进入时直接显示该提交步骤的下一步骤信息,如果下一步的信息还没有暂存时，则不回显下一步的暂存信息
              if (this.checkedStepIndex == this.currentStepIndex && this.currentStepIndex < 3) {
                this.checkedStepIndex = this.checkedStepIndex + 1
              } else {
                this.echoTemporaryStorageMessage(temporaryIndex)
              }
            } else {
              this.checkedStepIndex = this.claimRegisterElectronicSignatureMessage['checkedStepIndex'];
              // 防止返回上一页时,存储的电子签名信息被清空后,保管人签名为空(此时从电子签名页返回该页面后,不会回显暂存的拾金不昧信息,这里就手动给交接人和保管人签名赋值)
              if (this.checkedStepIndex == 1) {
                this.connectSignature = this.connectSignature ? this.connectSignature : this.temporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['connectSignature'];
                this.keeperSignature = this.keeperSignature ? this.keeperSignature : this.temporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['keeperSignature']
              }  
            }
          } else {
            if (this.checkedStepIndex == this.currentStepIndex && this.currentStepIndex < 3) {
              this.checkedStepIndex = this.checkedStepIndex + 1
            }
          };
          // 从更多页和签名页进来时,回显离开此页面时的步骤
          if (flag) {
            this.checkedStepIndex = this.claimRegisterElectronicSignatureMessage['checkedStepIndex']
          }
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
          message: `${err}`,
          closeOnPopstate: true
        }).then(() => {
        });
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false
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
    uploadImageToOss (filePath,itemIndex,flag) {
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
          if (!flag) {
            this.imgOnlinePathArr.push(`${aliyunServerURL}/${aliyunFileKey}`);
          } else {
            this.linkmanImgOnlinePathArr.push({
              signature: `${aliyunServerURL}/${aliyunFileKey}`,
              eventIndex: itemIndex
            })
          };
          resolve()
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

    // 拾金不昧事件
    async repairsEvent () {
      if (this.checkedStepIndex == 1) {
        if (!this.handoverTime) {
          this.$toast('交接时间不能为空');
          return
        };
        if (!this.connectSite) {
          this.$toast('交接地点不能为空');
          return
        };
        if (!this.claimRegisterElectronicSignatureMessage.connectSignature && !this.connectSignature) {
          this.$toast('交接人签字不能为空');
          return
        };
        if (!this.claimRegisterElectronicSignatureMessage.keeperSignature && !this.keeperSignature) {
          this.$toast('保管人签字不能为空');
          return
        };
        this.loadingText ='提交中';
        this.overlayShow = true;
        this.loadingShow = true;
        // 将交接人、保管人签名图片上传到阿里云
        let connectSignatureStepList = [this.claimRegisterElectronicSignatureMessage.connectSignature,this.claimRegisterElectronicSignatureMessage.keeperSignature];
        for (let imgI of connectSignatureStepList) {
          if (Object.keys(this.timeMessage).length > 0) {
          // 判断签名信息是否过期
          if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
            await this.getSign();
            await this.uploadImageToOss(imgI,'',false)
          } else {
            await this.uploadImageToOss(imgI,'',false)
          }
          } else {
          await this.getSign();
          await this.uploadImageToOss(imgI,'',false)
          }
        };
        // 拾金不昧交接
        let temporaryMessage = {
          time: this.getNowFormatDate(this.handoverTime),
          address: this.connectSite,
          from: this.imgOnlinePathArr[0], // 交接人签名
          to: this.imgOnlinePathArr[1], // 保管人签名
          id: this.eventId,
          modifyName: this.userName
        };
        this.postEventHandover(temporaryMessage)
      } else if (this.checkedStepIndex == 2) {
        if (!this.relationTime) {
          this.$toast('联系时间不能为空');
          return
        };
        if (!this.contactDepartment) {
          this.$toast('联系部门不能为空');
          return
        };
        if (!this.linkman) {
          this.$toast('联系人不能为空');
          return
        };
        if (!this.contactInformation) {
          this.$toast('联系情况不能为空');
          return
        };
        this.loadingText ='提交中';
        this.overlayShow = true;
        this.loadingShow = true;
        // 拾金不昧联系
        let temporaryMessage = {
          time: this.getNowFormatDate(this.relationTime),
          department: this.contactDepartment,
          name: this.linkman,
          situation: this.contactInformation,
          id: this.eventId,
          modifyName: this.userName
        };
        this.postEventContact(temporaryMessage)
      } else if (this.checkedStepIndex == 3) {
        if (!this.getTime) {
          this.$toast('领取时间不能为空');
          return
        };
        if (!this.getSite) {
          this.$toast('领取地点不能为空');
          return
        };
        if (this.getMessage.some((item) => { return item.finalLinkman == ''})) {
          this.$toast('联系人不能为空');
          return
        };
        if (this.getMessage.some((item) => { return item.getPersonIdNumber == ''})) {
          this.$toast('领取人身份证不能为空');
          return
        };
         if (this.getMessage.some((item) => { return item.getPersonSignature == ''})) {
          this.$toast('领取人签字不能为空');
          return
        };
        this.loadingText ='提交中';
        this.overlayShow = true;
        this.loadingShow = true;
        // 将领取人签名图片上传到阿里云
        for (let imgI of this.claimRegisterElectronicSignatureMessage['receiverSignature']) {
          if (Object.keys(this.timeMessage).length > 0) {
          // 判断签名信息是否过期
          if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
            await this.getSign();
            await this.uploadImageToOss(imgI['signature'],imgI['eventIndex'],true)
          } else {
            await this.uploadImageToOss(imgI['signature'],imgI['eventIndex'],true)
          }
          } else {
          await this.getSign();
          await this.uploadImageToOss(imgI['signature'],imgI['eventIndex'],true)
          }
        };
        // 将上传到阿里云上的领取人签名路径赋予对应的领取人签名信息字段
        for (let i = 0, len = this.getMessage.length; i < len; i++) {
          let temporaryItem = this.linkmanImgOnlinePathArr.filter((item) => { return item.eventIndex == i})[0];
          if (temporaryItem) {
            this.getMessage[i]['getPersonSignature'] = temporaryItem['signature']
          }
        };
        // 拾金不昧领取
        let temporaryMessage = {
          id: this.eventId,
          time: this.getNowFormatDate(this.getTime),
          address: this.getSite,
          people:[],
          modifyName: this.userName
        };
        for (let item of this.getMessage) {
          temporaryMessage['people'].push({
            cardNo: item['getPersonIdNumber'],
            content: item['getContentDescribe'],
            name: item['finalLinkman'],
            sign: item['getPersonSignature']
          })
        };
        this.postEventReceive(temporaryMessage)
      }
    },

    // 拾金不昧交接
    postEventHandover (data) {
      this.loadingText = '提交中...';
      this.loadingShow = true;
      this.overlayShow = true;
      eventHandover(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$Alert({message:"提交成功!",duration:3000,type:'success'});
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

    // 拾金不昧联系
    postEventContact (data) {
      this.loadingText = '提交中...';
      this.loadingShow = true;
      this.overlayShow = true;
      eventContact(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$Alert({message:"提交成功!",duration:3000,type:'success'});
          this.$router.push({path:'/eventList'})
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

    // 拾金不昧领取
    postEventReceive (data) {
      this.loadingText = '提交中...';
      this.loadingShow = true;
      this.overlayShow = true;
      eventReceive(data).then((res) => {
        if (res && res.data.code == 200) {
          this.$Alert({message:"提交成功!",duration:3000,type:'success'});
          // 提交成功后清除该历史拾金不昧列表暂存信息
          let casuallyTemporaryStorageHistoryClaimRegisterMessage = this.temporaryStorageHistoryClaimRegisterMessage.filter((item) => { return item.id != this.eventId});
          this.changeTemporaryStorageHistoryClaimRegisterMessage(casuallyTemporaryStorageHistoryClaimRegisterMessage);
          this.$router.push({path:'/eventList'});
        } else {
          this.linkmanImgOnlinePathArr = [];
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
        this.linkmanImgOnlinePathArr = [];
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


    // 删除事件
    delelteEvent () {
      this.loadingText = '删除中...';
      this.loadingShow = true;
      this.overlayShow = true;
      eventDelete(this.eventId).then((res) => {
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
    },

    // 暂存事件
    temporaryStorageEvent () {
      let casuallyTemporaryStorageHistoryClaimRegisterMessage = _.cloneDeep(this.temporaryStorageHistoryClaimRegisterMessage);
      if (this.temporaryStorageHistoryClaimRegisterMessage.length > 0 ) {
          let temporaryIndex = this.temporaryStorageHistoryClaimRegisterMessage.findIndex((item) => { return item.id == this.eventId});
          if (temporaryIndex != -1) {
            if (this.checkedStepIndex == 1){
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['checkedStepIndex'] = this.checkedStepIndex,
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['handoverTime'] = this.getNowFormatDate(this.handoverTime),
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['connectSite'] = this.connectSite,
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['connectSignature'] = this.claimRegisterElectronicSignatureMessage.connectSignature ? this.claimRegisterElectronicSignatureMessage.connectSignature : this.connectSignature,
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['keeperSignature'] = this.claimRegisterElectronicSignatureMessage.keeperSignature ? this.claimRegisterElectronicSignatureMessage.keeperSignature : this.keeperSignature
            } else if (this.checkedStepIndex == 2) {
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['checkedStepIndex'] = this.checkedStepIndex,
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['relationTime'] = this.getNowFormatDate(this.relationTime),
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['contactDepartment'] = this.contactDepartment,
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['linkman'] = this.linkman,
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['contactInformation'] = this.contactInformation
            } else if (this.checkedStepIndex == 3) {
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['checkedStepIndex'] = this.checkedStepIndex,
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['getTime'] = this.getNowFormatDate(this.getTime),
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['getSite'] = this.getSite,
              casuallyTemporaryStorageHistoryClaimRegisterMessage[temporaryIndex]['getMessage'] = _.cloneDeep(this.getMessage)
            }
          } else {
            if (this.checkedStepIndex == 1) {
              casuallyTemporaryStorageHistoryClaimRegisterMessage.push({
                id: this.eventId,
                checkedStepIndex: this.checkedStepIndex,
                handoverTime: this.getNowFormatDate(this.handoverTime),
                connectSite: this.connectSite,
                connectSignature: this.claimRegisterElectronicSignatureMessage.connectSignature ? this.claimRegisterElectronicSignatureMessage.connectSignature : this.connectSignature,
                keeperSignature: this.claimRegisterElectronicSignatureMessage.keeperSignature ? this.claimRegisterElectronicSignatureMessage.keeperSignature : this.keeperSignature
              })
            } else if (this.checkedStepIndex == 2) {
              casuallyTemporaryStorageHistoryClaimRegisterMessage.push({
                id: this.eventId,
                checkedStepIndex: this.checkedStepIndex,
                relationTime: this.getNowFormatDate(this.relationTime),
                contactDepartment: this.contactDepartment,
                linkman: this.linkman,
                contactInformation: this.contactInformation
              })
            } else if (this.checkedStepIndex == 3) {
              casuallyTemporaryStorageHistoryClaimRegisterMessage.push({
                id: this.eventId,
                checkedStepIndex: this.checkedStepIndex,
                getTime: this.getNowFormatDate(this.getTime),
                getSite: this.getSite,
                getMessage: _.cloneDeep(this.getMessage)
              })
            }
          }
        } else {
          if (this.checkedStepIndex == 1) {
              casuallyTemporaryStorageHistoryClaimRegisterMessage.push({
                id: this.eventId,
                checkedStepIndex: this.checkedStepIndex,
                handoverTime: this.getNowFormatDate(this.handoverTime),
                connectSite: this.connectSite,
                connectSignature: this.claimRegisterElectronicSignatureMessage.connectSignature ? this.claimRegisterElectronicSignatureMessage.connectSignature : this.connectSignature,
                keeperSignature: this.claimRegisterElectronicSignatureMessage.keeperSignature ? this.claimRegisterElectronicSignatureMessage.keeperSignature : this.keeperSignature
              })
            } else if (this.checkedStepIndex == 2) {
              casuallyTemporaryStorageHistoryClaimRegisterMessage.push({
                id: this.eventId,
                checkedStepIndex: this.checkedStepIndex,
                relationTime: this.getNowFormatDate(this.relationTime),
                contactDepartment: this.contactDepartment,
                linkman: this.linkman,
                contactInformation: this.contactInformation
              })
            } else if (this.checkedStepIndex == 3) {
              casuallyTemporaryStorageHistoryClaimRegisterMessage.push({
                id: this.eventId,
                checkedStepIndex: this.checkedStepIndex,
                getTime: this.getNowFormatDate(this.getTime),
                getSite: this.getSite,
                getMessage: _.cloneDeep(this.getMessage)
              })
            }
      };
      this.changeTemporaryStorageHistoryClaimRegisterMessage(casuallyTemporaryStorageHistoryClaimRegisterMessage);
      this.$Alert({message:"暂存成功",duration:3000,type:'success'});
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
  height: 0;
  .quit-info-box {
    /deep/ .van-dialog {
      .van-dialog__content {
          padding: 20px 16px 0 16px !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          .dialog-title {
            text-align: center;
            img {
              width: 24px;
              height: 24px
            }
          };
          .dialog-top {
            line-height: 20px;
            padding: 20px 0 10px 0;
            text-align: center;
            box-sizing: border-box;
            color: #101010;
            font-size: 16px;
            font-weight: bold
          }
          .dialog-center {
            line-height: 20px;
            padding: 10px 30px;
            box-sizing: border-box;
            color: #7a7a7a;
            font-size: 14px
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
            .checkSpanStyle {
              font-size: 16px !important;
              font-weight: bold;
              .bottom-border-1px(#3B9DF9,6px)
            };
            .completeSpanStyle {
              color: #289E8E !important;
              border-bottom: none !important
            };
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
              >span {
                display: inline-block;
                font-size: 14px;
                color: #BBBBBB;
              };
              .span-one {
                  width: 100%;
                  padding-left: 4px;
                  box-sizing: border-box
                };
                .span-two {
                  width: 70px;
                  height: 35px;
                  background: #fff;
                  img {
                    width: 100%;
                    height: 100%;
                  }
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