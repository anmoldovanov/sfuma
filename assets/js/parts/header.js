import anime from "animejs/lib/anime.es.js";
import sleep from "../helpers/sleep.js";

let mainMenu = document.querySelector(".main-nav");
if (mainMenu) {
   let menuRect = mainMenu.getBoundingClientRect();
   let marker = mainMenu.querySelector(".main-nav-marker");
   let items = [...mainMenu.querySelectorAll(".menu-item-has-children")];
   let menus = [...mainMenu.querySelectorAll(".sub-menu-wrapper")];
   let menusList = [...mainMenu.querySelectorAll(".sub-menu-wrapper ul")];
   let prevItem, prevIndex, prevMenu, prevMenuList;
   let animations = [];
   let prevFocus;

   const DURATION = 250;

   items.forEach((item, i) => {
      let menu = menus[i];
      let menuList = menusList[i];
      let rectItem = item.getBoundingClientRect();
      let itemPadding = parseFloat(window.getComputedStyle(item.querySelector("a")).getPropertyValue("padding-left"));

      item.addEventListener("mouseenter", onEnter);
      // item.addEventListener("focusin", onEnter);
      // item.addEventListener("focusout", (e) => {
      //    onLeave(e);
      // });
      item.addEventListener("mouseleave", onLeave);

      async function onEnter(e) {
         if (item.contains(e.relatedTarget)) {
            return;
         }
         let insideWrapper = !!e.relatedTarget?.closest(".menu-item-has-children");
         if (!insideWrapper) {
            await sleep(100);
            if (!item.matches(":hover,:focus-within")) return;
            animations.forEach((anim) => {
               anim.seek(0);
               anim.pause();
            });
            [...menus, ...menusList].forEach((el) => (el.style = ""));
         }

         animations.push(
            anime({
               targets: [marker, menu].filter(Boolean),
               width: {
                  value(el) {
                     return el == marker ? menu.offsetWidth : "";
                  },
                  duration: insideWrapper ? DURATION : 0,
               },
               height: {
                  value(el) {
                     return el == marker ? menu.offsetHeight : "";
                  },
                  duration: insideWrapper ? DURATION : 0,
               },
               left: {
                  value: rectItem.left - menuRect.left - itemPadding + "px",
                  duration: insideWrapper ? DURATION : 0,
               },
               opacity: insideWrapper ? 1 : [0, 1],
               scale: insideWrapper ? 1 : [0.85, 1],
               duration: DURATION,
               easing: "easeInOutSine",
               begin: function () {
                  menu.style.visibility = "visible";
               },
            }),
            anime({
               targets: menus.filter(Boolean),
               left: {
                  value: rectItem.left - menuRect.left - itemPadding + "px",
                  duration: insideWrapper ? DURATION : 0,
               },
               opacity: 1,
               scale: 1,
               duration: DURATION,
               easing: "easeInOutSine",
            })
         );
         if (insideWrapper) {
            let forward = i > prevIndex;
            animations.push(
               anime({
                  targets: [menuList, prevMenuList].filter(Boolean),
                  translateX(el) {
                     return el == menuList ? (forward ? ["20rem", 0] : ["-20rem", 0]) : forward ? [0, "-20rem"] : [0, "20rem"];
                  },
                  opacity(el) {
                     return el == menuList ? [0, 1] : [1, 0];
                  },
                  scale: 1,
                  duration: DURATION,
                  easing: "easeInOutSine",
                  begin: function () {
                     menu.style.visibility = "visible";
                  },
                  complete: function () {
                     if (prevMenu) {
                        prevMenu.style.visibility = "hidden";
                     }
                  },
               })
            );
         }
      }
      function onLeave(e) {
         prevItem = item;
         prevIndex = i;
         prevMenu = menu;
         prevMenuList = menuList;
         let insideWrapper = !!(e.relatedTarget || e.target)?.closest(".has-sublist");

         // console.log(insideWrapper, e.relatedTarget || e.target);
         if (!insideWrapper) {
            animations.push(
               anime({
                  targets: [marker, menuList],
                  opacity: 0,
                  scale: 0.85,
                  duration: DURATION,
                  easing: "easeInOutSine",
                  complete: function () {
                     menu.style.visibility = "hidden";
                  },
               })
            );
         }
      }
   });
}

let menuBtn = document.querySelector(".menu-btn");
if (menuBtn) {
   let targets = menuBtn.querySelectorAll("i");
   let onEnter = () => {
      menuBtn.classList.remove("menu-btn--reverse");
      anime({
         targets,
         scale: [{ value: 0, easing: "easeOutSine", duration: 200 }],
         delay: anime.stagger(50, { grid: [10], from: "first" }),
         complete: function (anim) {
            menuBtn.classList.add("menu-btn--reverse");
            anime({
               targets,
               scale: [{ value: 1, easing: "easeInOutQuad", duration: 200 }],
               delay: anime.stagger(50, { grid: [10], from: "first" }),
            });
         },
      });
   };
   menuBtn.addEventListener("mouseenter", onEnter);
   // menuBtn.addEventListener("focusin", onEnter);
}
