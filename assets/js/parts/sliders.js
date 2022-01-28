import anime from "animejs/lib/anime.es.js";
import { Swiper, Pagination, EffectFade, Autoplay, Navigation } from "swiper";
Swiper.use([Pagination, EffectFade, Autoplay, Navigation]);

document.querySelectorAll(`[data-slider="reviews"]`).forEach((wrapper) => {
   if (wrapper.querySelectorAll(".swiper-slide").length <= 1) return;
   new Swiper(wrapper.querySelector(".swiper-container"), {
      speed: 700,
      keyboard: true,
      loop: true,
      spaceBetween: 50,
      observer: true,
      slideToClickedSlide: true,
      centeredSlides: true,
      // effect: "fade",
      // fadeEffect: {
      //    crossFade: true,
      // },
      slidesPerView: 1,
      breakpoints: {
         1024: {
            slidesPerView: 1.4,
         },
         1250: {
            slidesPerView: 1.8,
         },
      },
      autoplay: {
         delay: 5000,
      },
      pagination: {
         el: wrapper.querySelector(".swiper-pagination"),
         clickable: true,
      },
      navigation: {
         nextEl: wrapper.querySelector(".swiper-button-next"),
         prevEl: wrapper.querySelector(".swiper-button-prev"),
      },
   });
});

document.querySelectorAll(`[data-slider="text-slider"]`).forEach((wrapper) => {
   new Swiper(wrapper.querySelector(".swiper-container"), {
      speed: 700,
      keyboard: true,
      loop: true,
      spaceBetween: 50,
      observer: true,
      slideToClickedSlide: true,
      slidesPerView: 1,
      centeredSlides: true,
      autoplay: {
         delay: 5000,
      },
      pagination: {
         el: wrapper.querySelector(".swiper-pagination"),
         clickable: true,
      },
   });
});

document.querySelectorAll(`[data-slider="cases-slider"]`).forEach((wrapper) => {
   let logos = wrapper.querySelectorAll(".cases-slider-logos button");
   logos.forEach((logo, i) => {
      logo.addEventListener("click", (e) => {
         swiper.slideTo(i + 1);
      });
   });
   let swiper = new Swiper(wrapper.querySelector(".swiper-container"), {
      speed: 700,
      keyboard: true,
      loop: true,
      spaceBetween: 50,
      observer: true,
      slideToClickedSlide: true,
      slidesPerView: 1,
      centeredSlides: true,
      autoplay: {
         delay: 5000,
      },
      pagination: {
         el: wrapper.querySelector(".swiper-pagination"),
         clickable: true,
      },
      navigation: {
         nextEl: wrapper.querySelector(".swiper-button-next"),
         prevEl: wrapper.querySelector(".swiper-button-prev"),
      },
      on: {
         slideChange: function (swiper) {
            let params = JSON.parse(swiper.slides[swiper.activeIndex].dataset.params);
            wrapper.style.setProperty("--case-color", params.color);
            logos.forEach((logo, i) => logo.classList.toggle("active", i == swiper.realIndex));

            wrapper.querySelector(".cases-slider__bg-logo-img").style.setProperty("background-image", `url(${params.logo})`);
            wrapper.querySelector(".cases-slider__link").setAttribute("href", params.url);
            let title = wrapper.querySelector(".cases-slider__title");
            let titleText = title.querySelector("span");

            anime({
               targets: title,
               opacity: [1, 0],
               translateY: [0, ".5rem"],
               easing: "easeInOutSine",
               duration: 320,
               update({ progress }) {
                  title.style.setProperty("--mask-percent", progress + "%");
               },
               complete() {
                  titleText.innerHTML = params.title;
                  anime({
                     targets: title,
                     opacity: [0, 1],
                     easing: "easeInOutSine",
                     duration: 320,
                     translateY: [".5rem", 0],
                     update({ progress }) {
                        title.style.setProperty("--mask-percent", 100 - progress + "%");
                     },
                  });
               },
            });
         },
      },
   });
});
