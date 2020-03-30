const carousel = ({
  slider,
  prev,
  next,
  container
}, $) => {
  slider = container.querySelector(slider);
  prev = container.querySelector(prev);
  next = container.querySelector(next);

  container.setAttribute('data-ampify-slider-container', '');
  slider.setAttribute('data-ampify-slider', '');
  prev.setAttribute('data-ampify-slider-prev', '');
  next.setAttribute('data-ampify-slider-next', '');

  $.injectCss(`
    .__ampify__load-slider { height: 100%; }
    .__ampify__load-slider [data-ampify-slider] > * { position: absolute !important; }
    .__ampify__anim-slider { transition: transform 300ms ease 0s; }
    [data-ampify-slider] { width: ${100 * slider.children.length}% !important; }
    [data-ampify-slider] > * { width: ${(100 / slider.children.length).toFixed(0)}% !important; }
  `);

  $(container)
    .data('ampify-height', container.offsetHeight)
    .addClass('__ampify__load-slider')
    .script({js: 'const btnPrev=document.querySelector("[data-ampify-slider-prev]"),btnNext=document.querySelector("[data-ampify-slider-next]"),slider=document.querySelector("[data-ampify-slider]"),container=document.querySelector("[data-ampify-slider-container]")||slider,length=slider.children.length,infinite=!0,drapSnap=100,animationDuration=300;let animTimeout,currentPercent,currentSlide;const calcPercent=e=>(currentPercent=100/length*e,currentPercent),goToSlide=(e,i=!0)=>{animTimeout||(i?addAnimation():removeAnimation(),currentSlide=e,slider.style.transform=`translate3d(-${calcPercent(e)}%, 0px, 0px)`)},addAnimation=()=>{slider.classList.add("__ampify__anim-slider"),animTimeout&&clearTimeout(animTimeout),animTimeout=setTimeout(()=>{animTimeout=null,onAnimationEnd()},300)},removeAnimation=()=>{slider.classList.remove("__ampify__anim-slider")},goToPrevSlide=()=>{goToSlide(currentSlide-1)},goToNextSlide=()=>{goToSlide(currentSlide+1)};btnPrev.addEventListener("click",()=>{goToPrevSlide()}),btnNext.addEventListener("click",()=>{goToNextSlide()});const initTouch=()=>{let e=null,i=0;slider.addEventListener("touchstart",t=>{removeAnimation();const n=(e=>e.touches||e.originalEvent.touches)(t)[0];i=0,e=n.clientX}),slider.addEventListener("touchmove",t=>{e&&(i=e-t.touches[0].clientX,slider.style.transform=`translate3d(calc(-${currentPercent}% - ${i}px), 0px, 0px)`)}),slider.addEventListener("touchend",()=>{Math.abs(i)<=100?goToSlide(currentSlide):i>0?goToNextSlide():goToPrevSlide()})},onAnimationEnd=()=>0===currentSlide?goToSlide(length-2,!1):currentSlide===length-1?goToSlide(1,!1):void 0,isFake=e=>null!==e.getAttribute("data-ampify-slide-fake"),initInfinite=()=>(isFake(slider.children[0]),isFake(slider.children.slice(-1)[0]),1),init=()=>{let e=0;isFake(slider.children[0]),isFake(slider.children.slice(-1)[0]),e=1,goToSlide(e,!1),initTouch(),container.classList.remove("__ampify__load-slider")};init();'});
};

export default carousel;