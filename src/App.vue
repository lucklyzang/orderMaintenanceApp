<template>
  <div id="app">
     <transition :name="transitionName" mode="out-in">
        <router-view class="child-view"></router-view>
    </transition>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        transitionName: ''
      }
    },
    mounted () {
      // if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      //   window.addEventListener('hashchange', () => {
      //       let currentPath = window.location.hash.slice(1)
      //       if (this.$route.path !== currentPath) {
      //           this.$router.push(currentPath);// 主动更改路由界面
      //       }
      //   }, false);
      // }
    },

    methods: {
    },

    watch: {
      '$route' (to, from) {
        if (to.name == 'home' && from.name == 'myInfo') {
          this.transitionName = '';
          return
        };
        if (to.name == 'home' && from.name == 'myObject') {
          this.transitionName = '';
          return
        };
        if (to.name == 'myInfo' && from.name == 'home') {
          this.transitionName = '';
          return
        };
        if (to.name == 'myInfo' && from.name == 'myObject') {
          this.transitionName = '';
          return
        };
        if (to.name == 'myObject' && from.name == 'home') {
          this.transitionName = '';
          return
        };
        if (to.name == 'myObject' && from.name == 'myInfo') {
          this.transitionName = '';
          return
        };
        if (to.name == 'home' && !from.name) {
          this.transitionName = 'slide-right';
          return
        };
        const toDepth = to.meta.index;
        const fromDepth = from.meta.index;
        if (toDepth > fromDepth) {
          this.transitionName = 'slide-right'
        } else {
          this.transitionName = 'slide-left'
        }
      }

    }
  };
  //App接口
  window['setAppInfo'] =function (uid,os) {
    window.os=os
    window.uid=uid
  }
  //H5接口
  window.addEventListener('message',function(event){
    let data = event.data
    if(data.os !== undefined){
      window.os=data.os
      window.uid=data.uid
    }
  },false)
</script>
<style lang="less" scoped>
  @import "~@/common/stylus/reset.less";
  @import "~@/common/stylus/variable.less";
  #app {
    position: relative;
    min-height: 100vh;
    width: 100%
  };
  .slide-right-leave-active,
  .slide-left-enter,
  .slide-right-enter,
  .slide-left-leave-active {
    width: 100%
  }
  .slide-left-enter, .slide-right-leave-active {
    opacity: 0;
    transition: all 0.5s ease;
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
  .slide-left-leave-active, .slide-right-enter {
    opacity: 0;
    transition: all 0.4s ease;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
  .slide-right-enter, .slide-left-leave-active {
    opacity: 0;
    transition: all 0.4s ease;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
  .slide-right-leave-active, .slide-left-enter {
    opacity: 0;
    transition: all 0.5s ease;
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
</style>
