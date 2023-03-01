<template>
  <div class="page-box" ref="wrapper">
    <van-loading size="35px" vertical color="#e6e6e6" v-show="loadingShow">{{ loadText }}</van-loading>
    <van-overlay :show="overlayShow" />
    <div class="nav">
      <van-nav-bar title="事件列表" left-text="返回" left-arrow @click-left="onClickLeft" @click-right="onClickRight" right-text="事件记录" :border="false">
      </van-nav-bar>
    </div>
    <div class="content">
        <div class="content-top-area">
          <img :src="statusBackgroundPng" />a
        </div>
        <div class="content-box">
            <div class="action-bar">
                <div class="action-bar-left">
                  <van-checkbox v-model="storageRadio" shape="square" @change="checkboxChangeEvent">暂存</van-checkbox>
                </div>
                <div class="action-bar-right">
                    <span :class="{'spanStyle': !isOnlyMe}" @click="onlyMeEvent">只看我</span>
                    <span @click="screenDialogShow = true">筛选</span>
                </div>
            </div>
            <div class="backlog-task-list-box" ref="scrollBacklogTask">
              <div class="backlog-task-list" v-for="(item,index) in fullBacklogTaskList" :key="index">
                  <div class="backlog-task-top">
                      <div class="backlog-task-top-left">
                          <span>事件类型:</span>
                          <span>{{ eventTypeTransform(item.eventType) }}</span>
                      </div>
                      <div class="backlog-task-top-right">
                          <span>{{ taskStatusTransition(item.state,item.eventType) }}</span>
                      </div>
                  </div>
                  <div class="backlog-task-content">
                      <div class="taskset-name">
                        <span>记录人:</span>
                        <span>{{ item.createName }}</span>
                      </div>
                      <div class="taskset-name">
                          <span>记录时间:</span>
                          <span>{{ item.createTime }}</span>
                      </div>
                      <div class="taskset-name">
                          <span>区域:</span>
                          <span>{{ `${item.structureName ? item.structureName : ''}-${item.depName ? item.depName : ''}-${item.roomName ? item.roomName : ''}` }}</span>
                      </div>
                      <div class="taskset-name">
                          <span>记录类型:</span>
                          <span>{{ registerTypeTransform(item.registerType) }}</span>
                      </div>
                  </div>
                  <div class="right-arrow-box" @click="taskDetailsEvent(item)">
                      <van-icon name="arrow" color="#1684FC" size="24" />
                  </div>
              </div>
              <van-empty description="暂无数据" v-show="backlogEmptyShow" />
              <div class="no-more-data" v-show="isShowBacklogTaskNoMoreData">没有更多数据了!</div>
          </div> 
        </div>
    </div>

    <!-- 事件类型选择弹窗 -->
    <div class="event-type-box">
      <van-dialog v-model="eventTypeShow" width="100%"
        confirm-button-color="#2390fe"
      >
        <div class="dialog-top">
          <div class="select-title">请选择事件类型</div>
          <van-icon name="cross" size="24" @click="eventTypeShow = false" />
        </div>
        <div class="dialog-center">
          <p v-for="(item,index) in eventTypeList" :key="index" @click="eventTypeClickEvent(item)">
            {{ item }}
          </p>
        </div>
      </van-dialog>
    </div>

    <!-- 日期查询范围 -->
    <div class="date-range">
      <van-calendar v-model="dateQueryRangeShow" color="#3B9DF9" type="range" @confirm="onDateRangeConfirm" :min-date="minDate" :max-date="maxDate"/>
    </div>

    <!-- 筛选弹窗 -->
    <div class="screen-box">
      <van-dialog v-model="screenDialogShow" width="100%" show-cancel-button 
        confirm-button-color="#2390fe"
        :before-close="beforeCloseDialogEvent"
        @confirm="screenDialogSure"
        @cancel="screenDialogCancel"
        confirm-button-text="确认"
        cancel-button-text="重置"
      >
        <div class="dialog-top">
          <div class="select-title">全部筛选</div>
          <van-icon name="cross" size="24" @click="closeScreenDialogEvent" />
        </div>
        <div class="dialog-center">
          <div class="dialog-center-one-line" @click="dateQueryRangeShow = true">
            <span>日期查询</span>
            <div class="date-range-box">
              {{ currentDateRange }}
              <img :src="dateIconPng" alt="">
            </div>
          </div>
          <div class="dialog-center-one-line">
            <span>登记人</span>
            <SelectSearch ref="registrantOption" :itemData="registrantOption" :curData="currentRegistrant" @change="registrantOptionChange" />
          </div>
          <div class="dialog-center-one-line">
            <span>事件类型</span>
            <SelectSearch :isNeedSearch="false" ref="eventTypeOption" :multiple="true" :itemData="eventTypeOption" :curData="currentEventType" @change="eventTypeOptionChange" />
          </div>
          <div class="dialog-center-one-line">
            <span>登记类型</span>
            <SelectSearch :isNeedSearch="false" ref="registerTypeOption" :multiple="true" :itemData="registerTypeOption" :curData="registerType" @change="registerTypeChange" />
          </div>
        </div>
      </van-dialog>
    </div>

  </div>
</template>
<script>
import NavBar from "@/components/NavBar";
import { mapGetters, mapMutations } from "vuex";
import { getEventList, queryRegisterUser } from '@/api/escortManagement.js'
import {mixinsDeviceReturn} from '@/mixins/deviceReturnFunction';
import ScrollSelection from "@/components/ScrollSelection";
import SelectSearch from "@/components/SelectSearch";
import qs from 'qs'
export default {
  name: "EventList",
  components: {
    NavBar,
    SelectSearch,
    ScrollSelection
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
      storageRadio: false,
      currentDateRange: '',
      currentStartDate: '',
      currentEndDate: '',
      minDate: new Date(2010, 0, 1),
      maxDate: new Date(2050, 0, 31),
      registerType: [1,2],
      eventTime: 0,
      timeOne: null,
      isLoadDataTime: null,
      totalCount: '',
      currentPage: 1,
      pageSize: 10,
      registerTypeOption: [
        {
            text: '请选择',
            value: null
        },
        {
            text: '巡查',
            value: 1,
            selected: true
        },
        {
            text: '其他',
            value: 2,
            selected: true
        }
      ],
      currentEventType: [1,2,3],
      eventTypeOption: [
        {
            text: '请选择',
            value: null
        },
        {
            text: '工程报修',
            value: 1,
            selected: true
        },
        {
            text: '拾金不昧',
            value: 2,
            selected: true
        },
        {
            text: '其他',
            value: 3,
            selected: true
        }
      ],

      currentRegistrant: null,
      registrantOption: [],
      isLoadData: true,
      eventTypeShow: false,
      eventTypeList: ['工程报修','拾金不昧','其他'],
      fullBacklogTaskList: [],
      echoFullBacklogTaskList: [],
      backlogTaskList: [],
      loadingShow: false,
      loadText: '加载中',
      statusBackgroundPng: require("@/common/images/home/status-background.png"),
      dateIconPng: require("@/common/images/home/date-icon.png")
    }
  },

  mounted() {
    // 控制设备物理返回按键
    this.deviceReturn("/home");
    this.$nextTick(()=> {
      this.initScrollChange()
    });
    // 查询登记用户
    this.getRegisterUser()
  },

  beforeRouteEnter(to, from, next) {
    next(vm=>{
      if (from.path == '/home') {
        vm.isOnlyMe = true;
        vm.storageRadio = false;
        // 获取事件列表
        vm.queryEventList(vm.currentPage,vm.pageSize,vm.userName)
      } else {
        vm.isOnlyMe = vm.enterEventRegisterPageMessage['isOnlyMe'];
        vm.storageRadio = vm.enterEventRegisterPageMessage['storageRadio'];
        if (!vm.storageRadio) {
          if (vm.isOnlyMe) {
            vm.queryEventList(vm.currentPage,vm.pageSize,vm.userName)
          } else {
            vm.queryEventList(vm.currentPage,vm.pageSize)
          }
        }  
      }
	  });
    next() 
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
    ...mapGetters(["userInfo","patrolTaskListMessage","departmentCheckList","enterEventRegisterPageMessage","temporaryStorageRepairsRegisterMessage","temporaryStorageOtherRegisterMessage","temporaryStorageClaimRegisterMessage"]),
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
    ...mapMutations(["changeDepartmentCheckList","changePatrolTaskListMessage","changeEnterEventRegisterPageMessage"]),

    // 顶部导航左边点击事件
    onClickLeft () {
      this.$router.push({path: '/home'})
    },

    // 是否暂存事件
    checkboxChangeEvent (checked) {
      this.fullBacklogTaskList = [];
      this.isShowBacklogTaskNoMoreData = false;
      if (checked) {
        this.fullBacklogTaskList = [].concat(this.temporaryStorageOtherRegisterMessage,this.temporaryStorageRepairsRegisterMessage,this.temporaryStorageClaimRegisterMessage);
        this.echoFullBacklogTaskList = [].concat(this.temporaryStorageOtherRegisterMessage,this.temporaryStorageRepairsRegisterMessage,this.temporaryStorageClaimRegisterMessage);
        if (this.fullBacklogTaskList.length == 0) {
          this.backlogEmptyShow = true
        } else {
          this.backlogEmptyShow = false
        }
      } else {
        this.currentPage = 1;
        if (this.isOnlyMe) {
          this.queryEventList(this.currentPage,this.pageSize,this.userName)
        } else {
          this.queryEventList(this.currentPage,this.pageSize)
        }
      }
    },

    // 事件类型转换
    eventTypeTransform (num) {
      switch(num) {
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

    // 登记类型转换
    registerTypeTransform (num) {
      switch(num) {
        case 1 :
          return '巡查'
          break;
        case 2 :
          return '其他'
          break
      }
    },


    // 是否只看我事件
   onlyMeEvent () {
    this.isOnlyMe = !this.isOnlyMe;
    this.isShowBacklogTaskNoMoreData = false;
    if (!this.storageRadio) {
      this.currentPage = 1;
      this.fullBacklogTaskList = [];
      if (this.isOnlyMe) {
        this.queryEventList(this.currentPage,this.pageSize,this.userName)
      } else {
        this.queryEventList(this.currentPage,this.pageSize)
      }
    }  
   },

    // 查询登记用户
    getRegisterUser() {
      this.loadingText = '查询中...';
      this.loadingShow = true;
      this.overlayShow = true;
      this.goalDepartmentOption = [];
      queryRegisterUser({proId:this.userInfo.proIds[0],system:6})
      .then((res) => {
        this.registrantOption = [{
          text: '请选择',
          value: null
        }],
        this.loadingText = '';
        this.loadingShow = false;
        this.overlayShow = false;
        if (res && res.data.code == 200) {
          if (res.data.data.length > 0) {
            for (let i = 0, len = res.data.data.length; i < len; i++) {
              this.registrantOption.push({
                text: res.data.data[i],
                value: i+1
              })
            };
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

    //截取日期(去除日期的时分秒)
    substringDate (date) {
      let temp = new Date(date);
      let needDtae = temp.getFullYear()+"-"+(temp.getMonth()+1)+"-"+temp.getDate();
      return needDtae
    },

    // 筛选弹框确定事件
    screenDialogSure () {
      // if (!this.storageRadio) {
      //   this.currentPage = 1;
      //   this.isOnlyMe = false;
      //   let register = this.currentRegistrant ? this.currentRegistrant['text'] == '请选择' ? '' : this.currentRegistrant['text'] : '';
      //   let eventType = [];
      //   let registerType = [];
      //   if (this.currentEventType.length > 0){
      //     if (this.currentEventType.some((el) => { return Object.prototype.toString.call(el) === '[object Object]'})) {
      //       for (let item of this.currentEventType) {
      //         eventType.push(item['value'])
      //       }
      //     }  else {
      //       eventType = this.currentEventType
      //     }
      //   } else {
      //     eventType = []
      //   };
      //   if (this.registerType.length > 0){
      //     if (this.registerType.some((el) => { return Object.prototype.toString.call(el) === '[object Object]'})) {
      //       for (let item of this.registerType) {
      //         registerType.push(item['value'])
      //       }
      //     }  else {
      //       registerType = this.registerType
      //     }
      //   } else {
      //     registerType = []
      //   };
      //   this.queryEventList(this.currentPage,this.pageSize,register,this.currentStartDate,this.currentEndDate,eventType,registerType)
      // } else {
      //   // 筛选本地暂存数据
      //   if (!this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length == 0) {
      //     this.fullBacklogTaskList = this.echoFullBacklogTaskList;
      //     if (this.fullBacklogTaskList.length == 0) {
      //       this.backlogEmptyShow = true
      //     } else {
      //       this.backlogEmptyShow = false
      //     }
      //   } else {
      //     let eventType = [];
      //     let registerType = [];
      //     if (this.currentEventType.length > 0){
      //       if (this.currentEventType.some((el) => { return Object.prototype.toString.call(el) === '[object Object]'})) {
      //         for (let item of this.currentEventType) {
      //           eventType.push(item['value'])
      //         }
      //       }  else {
      //         eventType = this.currentEventType
      //       }
      //     } else {
      //       eventType = []
      //     };
      //     if (this.registerType.length > 0){
      //       if (this.registerType.some((el) => { return Object.prototype.toString.call(el) === '[object Object]'})) {
      //         for (let item of this.registerType) {
      //           registerType.push(item['value'])
      //         }
      //       }  else {
      //         registerType = this.registerType
      //       }
      //     } else {
      //       registerType = []
      //     };
      //     this.fullBacklogTaskList = this.echoFullBacklogTaskList.filter((item) => {
      //       if (this.currentDateRange && this.currentRegistrant && this.currentEventType.length > 0 && this.registerType.length > 0) {
      //           return item['createName'] == this.currentRegistrant['text'] &&
      //           (new Date(item['createTime']).getTime() >= new Date(this.currentStartDate).getTime() && new Date(item['createTime']).getTime() <= new Date(this.currentEndDate).getTime())
      //           && eventType.indexOf(item['eventType']) != -1
      //           && registerType.indexOf(item['registerType']) != -1
      //         } else {
      //           // 日期排列
      //           if (this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length == 0) {
      //             return new Date(item['createTime']).getTime() >= new Date(this.currentStartDate).getTime() && new Date(item['createTime']).getTime() <= new Date(this.currentEndDate).getTime()
      //           } else if (this.currentDateRange && this.currentRegistrant && this.currentEventType.length == 0 && this.registerType.length == 0) {
      //             return item['createName'] == this.currentRegistrant['text'] &&
      //             (new Date(item['createTime']).getTime() >= new Date(this.currentStartDate).getTime() && new Date(item['createTime']).getTime() <= new Date(this.currentEndDate).getTime())
      //           } else if (this.currentDateRange && this.currentRegistrant && this.currentEventType.length > 0 && this.registerType.length == 0) {
      //             return item['createName'] == this.currentRegistrant['text'] &&
      //             (new Date(item['createTime']).getTime() >= new Date(this.currentStartDate).getTime() && new Date(item['createTime']).getTime() <= new Date(this.currentEndDate).getTime())
      //             && eventType.indexOf(item['eventType']) != -1
      //           } else if (this.currentDateRange && this.currentRegistrant && this.currentEventType.length > 0 && this.registerType.length > 0) {
      //             return item['createName'] == this.currentRegistrant['text'] &&
      //             (new Date(item['createTime']).getTime() >= new Date(this.currentStartDate).getTime() && new Date(item['createTime']).getTime() <= new Date(this.currentEndDate).getTime())
      //             && eventType.indexOf(item['eventType']) != -1 && registerType.indexOf(item['registerType']) != -1
      //           // 登记人排列
      //           } else if (!this.currentDateRange && this.currentRegistrant && this.currentEventType.length == 0 && this.registerType.length == 0) {
      //             return item['createName'] == this.currentRegistrant['text']
      //           } else if (!this.currentDateRange && this.currentRegistrant && this.currentEventType.length > 0 && this.registerType.length == 0) {
      //             return item['createName'] == this.currentRegistrant['text'] && eventType.indexOf(item['eventType']) != -1
      //           } else if (!this.currentDateRange && this.currentRegistrant && this.currentEventType.length > 0 && this.registerType.length > 0) {
      //             return item['createName'] == this.currentRegistrant['text'] && eventType.indexOf(item['eventType']) != -1 && registerType.indexOf(item['registerType']) != -1
      //             // 事件类型排列
      //           } else if (!this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length == 0) {
      //             return eventType.indexOf(item['eventType']) != -1
      //           } else if (!this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length > 0) {
      //             return eventType.indexOf(item['eventType']) != -1 && registerType.indexOf(item['registerType']) != -1
      //           }
      //           // 登记类型排列
      //           else if (!this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length > 0) {
      //             return registerType.indexOf(item['registerType']) != -1
      //           // 剩余排列
      //           } else if (this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length > 0) {
      //             return (new Date(item['createTime']).getTime() >= new Date(this.currentStartDate).getTime() && new Date(item['createTime']).getTime() <= new Date(this.currentEndDate).getTime()) && registerType.indexOf(item['registerType']) != -1
      //           } else if (this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length == 0) {
      //             return (new Date(item['createTime']).getTime() >= new Date(this.currentStartDate).getTime() && new Date(item['createTime']).getTime() <= new Date(this.currentEndDate).getTime()) && eventType.indexOf(item['eventType']) != -1
      //           } else if (!this.currentDateRange && this.currentRegistrant && this.currentEventType.length == 0 && this.registerType.length > 0) {
      //             return item['createName'] == this.currentRegistrant['text'] && registerType.indexOf(item['registerType']) != -1
      //           } else if (this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length > 0) {
      //             return (new Date(item['createTime']).getTime() >= new Date(this.currentStartDate).getTime() && new Date(item['createTime']).getTime() <= new Date(this.currentEndDate).getTime()) && eventType.indexOf(item['eventType']) != -1 && registerType.indexOf(item['registerType']) != -1
      //           }
      //         }
      //     });
      //     if (this.fullBacklogTaskList.length == 0) {
      //       this.backlogEmptyShow = true
      //     } else {
      //       this.backlogEmptyShow = false
      //     }
      //   }  
      // }
      // 点击筛选后不在加载远程数据
      this.isLoadData = false;
      // 数据筛选完毕后,可以加载数据
      this.isLoadDataTime = setTimeout(() => { this.isLoadData = true },1000);
      if (!this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length == 0) {
        this.fullBacklogTaskList = this.echoFullBacklogTaskList;
        if (this.fullBacklogTaskList.length == 0) {
          this.backlogEmptyShow = true
        } else {
          this.backlogEmptyShow = false
        }
      } else {
        let eventType = [];
        let registerType = [];
        if (this.currentEventType.length > 0){
          if (this.currentEventType.some((el) => { return Object.prototype.toString.call(el) === '[object Object]'})) {
            for (let item of this.currentEventType) {
              eventType.push(item['value'])
            }
          }  else {
            eventType = this.currentEventType
          }
        } else {
          eventType = []
        };
        if (this.registerType.length > 0){
          if (this.registerType.some((el) => { return Object.prototype.toString.call(el) === '[object Object]'})) {
            for (let item of this.registerType) {
              registerType.push(item['value'])
            }
          }  else {
            registerType = this.registerType
          }
        } else {
          registerType = []
        };
        this.fullBacklogTaskList = this.echoFullBacklogTaskList.filter((item) => {
          if (this.currentDateRange && (this.currentRegistrant && this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length > 0) {
              return item['createName'] == this.currentRegistrant['text'] &&
              (new Date(this.substringDate(item['createTime'])).getTime() >= new Date(this.currentStartDate).getTime() && new Date(this.substringDate(item['createTime'])).getTime() <= new Date(this.currentEndDate).getTime())
              && eventType.indexOf(item['eventType']) != -1
              && registerType.indexOf(item['registerType']) != -1
            } else {
              console.log('既然去七日起',this.substringDate(item['createTime']),this.currentStartDate,this.currentEndDate);
              // 日期排列
              if (this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length == 0) {
                return new Date(this.substringDate(item['createTime'])).getTime() >= new Date(this.currentStartDate).getTime() && new Date(this.substringDate(item['createTime'])).getTime() <= new Date(this.currentEndDate).getTime()
              } else if (this.currentDateRange && (this.currentRegistrant && this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length == 0) {
                return item['createName'] == this.currentRegistrant['text'] &&
                (new Date(this.substringDate(item['createTime'])).getTime() >= new Date(this.currentStartDate).getTime() && new Date(this.substringDate(item['createTime'])).getTime() <= new Date(this.currentEndDate).getTime())
              } else if (this.currentDateRange && (this.currentRegistrant && this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length == 0) {
                return item['createName'] == this.currentRegistrant['text'] &&
                (new Date(this.substringDate(item['createTime'])).getTime() >= new Date(this.currentStartDate).getTime() && new Date(this.substringDate(item['createTime'])).getTime() <= new Date(this.currentEndDate).getTime())
                && eventType.indexOf(item['eventType']) != -1
              } else if (this.currentDateRange && (this.currentRegistrant && this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length > 0) {
                return item['createName'] == this.currentRegistrant['text'] &&
                (new Date(this.substringDate(item['createTime'])).getTime() >= new Date(this.currentStartDate).getTime() && new Date(this.substringDate(item['createTime'])).getTime() <= new Date(this.currentEndDate).getTime())
                && eventType.indexOf(item['eventType']) != -1 && registerType.indexOf(item['registerType']) != -1
              // 登记人排列
              } else if (!this.currentDateRange && (this.currentRegistrant && this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length == 0) {
                return item['createName'] == this.currentRegistrant['text']
              } else if (!this.currentDateRange && (this.currentRegistrant && this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length == 0) {
                return item['createName'] == this.currentRegistrant['text'] && eventType.indexOf(item['eventType']) != -1
              } else if (!this.currentDateRange && (this.currentRegistrant && this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length > 0) {
                return item['createName'] == this.currentRegistrant['text'] && eventType.indexOf(item['eventType']) != -1 && registerType.indexOf(item['registerType']) != -1
                // 事件类型排列
              } else if (!this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length == 0) {
                return eventType.indexOf(item['eventType']) != -1
              } else if (!this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length > 0) {
                return eventType.indexOf(item['eventType']) != -1 && registerType.indexOf(item['registerType']) != -1
              }
              // 登记类型排列
              else if (!this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length > 0) {
                return registerType.indexOf(item['registerType']) != -1
              // 剩余排列
              } else if (this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length > 0) {
                return (new Date(this.substringDate(item['createTime'])).getTime() >= new Date(this.currentStartDate).getTime() && new Date(this.substringDate(item['createTime'])).getTime() <= new Date(this.currentEndDate).getTime()) && registerType.indexOf(item['registerType']) != -1
              } else if (this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length == 0) {
                return (new Date(this.substringDate(item['createTime'])).getTime() >= new Date(this.currentStartDate).getTime() && new Date(this.substringDate(item['createTime'])).getTime() <= new Date(this.currentEndDate).getTime()) && eventType.indexOf(item['eventType']) != -1
              } else if (!this.currentDateRange && (this.currentRegistrant && this.currentRegistrant['value']) && this.currentEventType.length == 0 && this.registerType.length > 0) {
                return item['createName'] == this.currentRegistrant['text'] && registerType.indexOf(item['registerType']) != -1
              } else if (this.currentDateRange && (!this.currentRegistrant || !this.currentRegistrant['value']) && this.currentEventType.length > 0 && this.registerType.length > 0) {
                return (new Date(this.substringDate(item['createTime'])).getTime() >= new Date(this.currentStartDate).getTime() && new Date(this.substringDate(item['createTime'])).getTime() <= new Date(this.currentEndDate).getTime()) && eventType.indexOf(item['eventType']) != -1 && registerType.indexOf(item['registerType']) != -1
              }
            }
        });
        if (this.fullBacklogTaskList.length == 0) {
          this.backlogEmptyShow = true
        } else {
          this.backlogEmptyShow = false
        }
      };
      this.isShowBacklogTaskNoMoreData = false
    },

    // 筛选弹框取消事件
    screenDialogCancel () {
    },

    // 筛选弹框关闭前事件
    beforeCloseDialogEvent (action, done) {
      if (action == 'cancel') {
        this.currentDateRange = '';
        this.currentStartDate = '';
        this.currentEndDate = '';
        this.$refs['registrantOption'].clearSelectValue();
        this.$refs['eventTypeOption'].selectAllValue();
        this.$refs['registerTypeOption'].selectAllValue();
        console.log('登记人',this.currentRegistrant);
        done(false);
        return
      } else {
        done()
      }
    },

    // 关闭筛选弹框
    closeScreenDialogEvent () {
      this.screenDialogShow = false
    },


    // 登记人下拉框值改变事件
    registrantOptionChange (val) {
      this.currentRegistrant = val
    },

    // 事件类型下拉框值改变事件
    eventTypeOptionChange (val) {
      this.currentEventType = val;
      console.log('事件类型',this.currentEventType)
    },

    // 登记类型下拉框值改变事件
    registerTypeChange (val) {
      this.registerType = val
    },

    formatDate(date) {
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    },

    // 日期类型范围选择确定
    onDateRangeConfirm(date) {
      const [start, end] = date;
      this.dateQueryRangeShow = false;
      this.currentDateRange = `${this.formatDate(start)} - ${this.formatDate(end)}`;
      this.currentStartDate = this.formatDate(start).replaceAll('/','-');
      this.currentEndDate = this.formatDate(end).replaceAll('/','-')
    },

    // 事件列表注册滚动事件
    initScrollChange () {
      let boxBackScroll = this.$refs['scrollBacklogTask'];
      boxBackScroll.addEventListener('scroll',this.eventListLoadMore,true)
    },

    // 事件列表加载事件
    eventListLoadMore () {
      // 暂存的数据不进行上拉加载
      if (this.storageRadio) {return};
      let boxBackScroll = this.$refs['scrollBacklogTask'];
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
          console.log('事件列表滚动了',boxBackScroll.scrollTop, boxBackScroll.offsetHeight, boxBackScroll.scrollHeight)
        },300)
      }
    },

    // 任务状态转换
    taskStatusTransition (num,eventType) {
      if (eventType == 1) {
        switch(num) {
          case -1 :
              return '已暂存'
              break;
          case 0 :
              return '已报修'
              break;
          case 3 :
              return '已完成/已取消'
              break
        }
      } else if (eventType == 2) {
        switch(num) {
          case -1 :
              return '已暂存'
              break;
          case 0 :
              return '已登记'
              break;
          case 1 :
              return '已交接'
              break;
          case 2 :
            return '已联系'
            break;
          case 3 :
              return '已领取'
              break
        }
      } else if (eventType == 3) {
        switch(num) {
          case -1 :
              return '已暂存'
              break;
          case 0 :
              return '已登记'
              break
        }
      }
    },

    // 事件登记事件
    onClickRight () {
      this.eventTypeShow = true
    },

    // 进入事件详情事件
    taskDetailsEvent (item) {
      // 1-工程报修,2-拾金不昧,3-其他
      if (item.eventType == 1) {
        if (item.state == -1) {
          this.$router.push({path: '/repairsRegister',query:{eventId: item.id}})
          //已报修
        } else if (item.state == 0 || item.state == 3) {
          this.$router.push({path: '/historyRepairsRegister',query:{eventId: item.id}})
        }
      } else if (item.eventType == 2) {
        if (item.state == -1) {
          this.$router.push({path: '/claimRegister',query:{eventId: item.id}})
          //已登记
        } else if (item.state == 0 || item.state == 1 || item.state == 2 || item.state == 3) {
          this.$router.push({path: '/historyClaimRegister',query:{eventId: item.id}})
        }
      } else if (item.eventType == 3) {
        if (item.state == -1) {
          this.$router.push({path: '/otherRegister',query:{eventId: item.id}})
          //已登记
        } else if (item.state == 0 || item.state == 3) {
          this.$router.push({path: '/historyOtherRegister',query:{eventId: item.id}})
        }
      };
      let temporaryEnterEventRegisterPageMessage = this.enterEventRegisterPageMessage;
      temporaryEnterEventRegisterPageMessage['isOnlyMe'] = this.isOnlyMe;
      temporaryEnterEventRegisterPageMessage['storageRadio'] = this.storageRadio;
      temporaryEnterEventRegisterPageMessage['patrolItemName'] = '';
      temporaryEnterEventRegisterPageMessage['checkItemId'] = '';
      temporaryEnterEventRegisterPageMessage['enterRegisterEventPageSource'] = '/eventList';
      this.changeEnterEventRegisterPageMessage(temporaryEnterEventRegisterPageMessage)
    },

    // 事件类型点击事件
    eventTypeClickEvent (item) {
      // 保存进入事件登记页的相关信息
      let temporaryEnterEventRegisterPageMessage = this.enterEventRegisterPageMessage;
      if ( item == '工程报修') {
        temporaryEnterEventRegisterPageMessage['eventType'] = '工程报修';
        this.$router.push({path: '/repairsRegister'})
      } else if (item == '拾金不昧') {
        temporaryEnterEventRegisterPageMessage['eventType'] = '拾金不昧';
        this.$router.push({path: '/claimRegister'})
      } else if (item == '其他') {
        temporaryEnterEventRegisterPageMessage['eventType'] = '其他';
        this.$router.push({path: '/otherRegister'})
      };
      temporaryEnterEventRegisterPageMessage['isOnlyMe'] = this.isOnlyMe;
      temporaryEnterEventRegisterPageMessage['storageRadio'] = this.storageRadio;
      temporaryEnterEventRegisterPageMessage['registerType'] = '其他';
      temporaryEnterEventRegisterPageMessage['patrolItemName'] = '';
      temporaryEnterEventRegisterPageMessage['resultId'] = '';
      temporaryEnterEventRegisterPageMessage['structId'] = '';
      temporaryEnterEventRegisterPageMessage['depId'] = '';
      temporaryEnterEventRegisterPageMessage['checkItemId'] = '';
      temporaryEnterEventRegisterPageMessage['enterRegisterEventPageSource'] = '/eventList';
      temporaryEnterEventRegisterPageMessage['depName'] = '';
      this.changeEnterEventRegisterPageMessage(temporaryEnterEventRegisterPageMessage)
    },

    // 获取事件列表
    queryEventList (page,pageSize,name='',startDate='',endDate='',eventType=[],registerType=[]) {
      this.loadingShow = true;
      this.overlayShow = true;
      this.loadText = '加载中';
      this.backlogEmptyShow = false;
      this.isShowBacklogTaskNoMoreData = false;
      getEventList({proId:this.userInfo.proIds[0], system: 6, 
        workerId: this.userInfo.id,page, limit:pageSize, name,
        startDate,endDate,eventType:eventType,registerType
      })
        .then((res) => {
            this.loadingShow = false;
            this.overlayShow = false;
            this.loadText = '';
            if (res && res.data.code == 200) {
                  this.backlogTaskList = res.data.data.list;
                  this.totalCount = res.data.data.total;
                  this.fullBacklogTaskList = this.fullBacklogTaskList.concat(this.backlogTaskList);
                  this.echoFullBacklogTaskList = this.fullBacklogTaskList;
                  if (this.fullBacklogTaskList.length == 0) {
                    this.backlogEmptyShow = true
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
        this.loadText = '';
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
  .event-type-box {
    /deep/ .van-dialog {
      top: auto !important;
      left: 0 !important;
      border-right: 1px solid #fff;
      bottom: 0 !important;
      border-top-left-radius: 20px !important;
      border-top-right-radius: 20px !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      transform: translate3d(0,0,0) !important;
      .van-dialog__content {
        padding: 0 20px 10px 20px !important;
        box-sizing: border-box;
        height: 50vh;
        .dialog-top {
          height: 60px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          .select-title {
            font-size: 18px;
            color: #101010;
            text-align: center
          };
          .van-icon {
            position: absolute !important;
            top: 50%;
            transform: translateY(-50%);
            right: 0
          }
        };
        .dialog-center {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding-top: 30px;
          box-sizing: border-box;
          >p {
            width: 121px;
            height: 43px;
            border: 1px solid #3B9DF9;
            border-radius: 10px;
            font-size: 14px;
            color: #3B9DF9;
            text-align: center;
            line-height: 43px;
            margin-bottom: 30px
          }
        }
      };
      .van-dialog__footer {
        display: none
      };
      .van-hairline--top::after {
        border-top-width: 0 !important
      }
    }
  };
  .screen-box {
    /deep/ .van-dialog {
      top: auto !important;
      left: 0 !important;
      border-right: 1px solid #fff;
      bottom: 0 !important;
      border-top-left-radius: 20px !important;
      border-top-right-radius: 20px !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      transform: translate3d(0,0,0) !important;
      .van-dialog__content {
        padding: 0 20px 10px 20px !important;
        box-sizing: border-box;
        height: 40vh;
        .dialog-top {
          height: 60px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          .select-title {
            font-size: 18px;
            color: #101010;
            text-align: center
          };
          .van-icon {
            position: absolute !important;
            top: 50%;
            transform: translateY(-50%);
            right: 0
          }
        };
        .dialog-center {
          .dialog-center-one-line {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            >span {
              display: inline-block;
              &:nth-child(1) {
                width: 25%;
                font-size: 14px;
                color: #101010;
                font-weight: bold
              }
            };
            .vue-dropdown {
              width: 100%;
              border-radius: 6px !important
            };
            .date-range-box {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              line-height: 32px;
              padding: 0 4px;
              box-sizing: border-box;
              color: #101010;
              height: 32px;
              width: 100%;
              border-radius: 6px !important;
              border: 1px solid #BBBBBB;
              position: relative;
              img {
                position: absolute;
                width: 15px;
                height: 15px;
                top: 50%;
                transform: translateY(-50%);
                right: 4px
              }
            };
          }
        }
      };
      .van-dialog__footer {
          padding: 20px !important;
          box-sizing: border-box;
          justify-content: space-between;
          ::after {
            content: none
          };
        .van-dialog__cancel {
            color: #1864FF;
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            background: #fff;
            border-radius: 30px;
            margin-right: 20px
        };
        .van-dialog__confirm {
            background: linear-gradient(to right, #6cd2f8, #2390fe);
            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
            color: #fff !important;
            border-radius: 30px;
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
            padding: 10px 8px;
            box-sizing: border-box;
            display: flex;
            background: #fff;
            justify-content: space-between;
            align-items: center;
            .action-bar-left {

            };
            .action-bar-right {
                >span {
                    font-size: 14px;
                    display: inline-block;
                    width: 76px;
                    height: 26px;
                    text-align: center;
                    line-height: 26px;
                    border-radius: 4px;
                    &:nth-child(1) {
                        color: #fff;
                        margin-right: 6px;
                        background: #3B9DF9
                    };
                    &:nth-child(2) {
                        color: #3B9DF9;
                        border: 1px solid #3B9DF9
                    }
                };
                .spanStyle {
                    background: #fff !important;
                    color: #3B9DF9 !important;
                    border: 1px solid #3B9DF9 !important
                }
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
                  font-size: 14px;
                  color: #1684FC;
                  .backlog-task-top-left {
                      flex: 1;
                      .no-wrap()
                  };
                  .backlog-task-top-right {
                      width: 70px;
                      text-align: center;
                      span {
                          display: inline-block;
                          width: 62px;
                          height: 22px;
                          text-align: right;
                          line-height: 22px;
                          color: #101010;
                          border-radius: 6px;
                      };
                      .spanNoStartStyle {
                          color: #174E97;
                      };
                      .spanCompletedStyle {
                          color: #101010;
                      }
                  }
              };
              .backlog-task-content {
                  >div {
                  line-height: 28px;
                  word-break: break-all;
                  font-size: 14px;
                  color: #8E9397  
                  };
                  .taskset-create-time-type {
                    display: flex;
                    flex-direction: column
                  };
                  .complete-patrol-area {
                      >span {
                          &:nth-child(2) {
                              color: #1684FC
                          }
                      }
                  };
                  .unfinished-patrol-area {
                      >span {
                          &:nth-child(2) {
                              color: #1684FC
                          }
                      }
                  }
              };
              .right-arrow-box {
                position: absolute;
                display: flex;
                justify-content: center;
                align-items: center;
                right: 8px;
                top: 50%;
                transform: translateY(-50%)
            }
          };
          .no-more-data {
              font-size: 12px;
              color: #BEC7D1;
              width: 100%;
              text-align: center;
              line-height: 30px
          }
      }
    }    
  }
}
</style>