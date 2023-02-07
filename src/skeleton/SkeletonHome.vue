<template>
   <!-- 启动页 -->
        <div class="main">
            <div class="top">
                <!-- <img src="../../static/img/default-person.png" alt=""> -->
            </div>
        </div>
</template>

<script>
export default {

}
</script>

<style lang='less' scoped>
    @import "../common/stylus/variable.less";
    @import "../common/stylus/mixin.less";
    @import "../common/stylus/modifyUi.less";
    .main {
        .content-wrapper();
        min-height: 100vh;
        background: @color-background;
        .top {
            flex:1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            >img {
                width: 50%
            }
        }
    }
</style>