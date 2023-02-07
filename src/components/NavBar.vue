<template>
  <div class="tabBar-box">
    <van-nav-bar
      :title="title"
      :left-text="leftText"
      :right-text="rightText"
      :left-arrow="leftArrow"
      :placeholder="placeholder"
      :border="border"
      :fixed="fixed"
      :z-index="Zindex"
      :safe-area-inset-top="safeAreaInsetTop"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />
  </div>  
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'NavBar',
  props:{
    title: {
      type: String,
      default: ''
    },
    leftText: {
      type: String,
      default: '返回'
    },
    leftArrow: {
      type: Boolean,
      default: true
    },
    Zindex: {
      type: Number,
      default: 1000
    },
    fixed: {
      type: Boolean,
      default: true
    },
    border: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: Boolean,
      default: true
    },
    safeAreaInsetTop: {
      type: Boolean,
      default: true
    },
    rightText: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    }
  },

  computed:{
    ...mapGetters([
      'isTokenExpired',
      'isEnterLoginPageSource'
    ])
  },

  methods: {
    onClickLeft() {
      this.$router.push({path: this.path})
    },
    onClickRight() {
    }
  }
}
</script>

<style lang='less' scoped>
  @import "../common/stylus/mixin.less";
  @import "../common/stylus/variable.less";
  .tabBar-box  {
    /deep/ .van-nav-bar {
      background: transparent
    }
  }
</style>
