import Vue from 'vue';
import SkeletonHome from './SkeletonHome';

export default new Vue({
  components: {
    SkeletonHome
  },
  template: `<div>
    <SkeletonHome id="skeleton-home"/>
  </div>`
});