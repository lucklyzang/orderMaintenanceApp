import Vue from 'vue'

// 防重复点击
export default {
  install(Vue) {
    Vue.directive('preventReClick', {
      inserted(el, binding) {
        let timer = null;
        const delay = binding.value || 3000;
        
        const clickHandler = (event) => {
          if (timer) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          
          el.style.pointerEvents = 'none';
          el.setAttribute('data-original-cursor', el.style.cursor);
          el.style.cursor = 'not-allowed';
          
          timer = setTimeout(() => {
            el.style.pointerEvents = '';
            el.style.cursor = el.getAttribute('data-original-cursor') || '';
            el.removeAttribute('data-original-cursor');
            timer = null;
          }, delay);
        };
        
        el._preventReClickHandler = clickHandler;
        el.addEventListener('click', clickHandler);
      },
      
      unbind(el) {
        if (el._preventReClickHandler) {
          el.removeEventListener('click', el._preventReClickHandler);
          el._preventReClickHandler = null;
        }
      }
    })
  }
}