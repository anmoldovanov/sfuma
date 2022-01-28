import anime from "animejs/lib/anime.es.js";

class Item {
   constructor(item, wrapper) {
      this.wrapper = wrapper;
      this.item = item;
      this.active = this.item.classList.contains("active");
      this.updateSizes();
      window.addEventListener("resize", () => {
         this.updateSizes();
         this.updateProgress();
      });
      this.updateProgress();
      this.item.addEventListener("mouseenter", this.onEnter.bind(this));
      this.item.addEventListener("mouseleave", this.onLeave.bind(this));
      // this.item.addEventListener("focusin", this.onEnter.bind(this));
      // this.item.addEventListener("focusout", this.onLeave.bind(this));
   }
   updateSizes() {
      this.left = this.item.offsetLeft;
      this.width = this.item.offsetWidth;
   }
   updateProgress() {
      this.item.style.setProperty("--left", this.left + "px");
      this.item.style.setProperty("--width", this.width + "px");
   }
   async onEnter(e) {
      let insideWrapper = e.relatedTarget && !!e.relatedTarget.closest("[data-solutions]");
      // let activeItem = this.wrapper.activeItem;
      if (!insideWrapper) {
         // await sleep(100);
         // if (!this.wrapper.wrapper.matches(":hover")) return;
         this.wrapper.setProgress(this.left, this.width);
      }
      this.wrapper.updateMarker(this, insideWrapper);
      this.item.classList.toggle("from-inside", insideWrapper);
      this.item.classList.add("hovered");
   }
   onLeave(e) {
      this.anim.pause();
      let insideWrapper = !!e.relatedTarget?.closest("[data-solutions]");
      if (!insideWrapper && this !== this.wrapper.activeItem) {
         this.wrapper.setActive();
      }
      this.item.classList.remove("from-inside", "hovered");
   }
}
class MarkerTabs {
   constructor(wrapper) {
      this.wrapper = wrapper;
      this.marker = wrapper.querySelector("[data-solutions-marker]");
      this.itemsElems = [...wrapper.querySelectorAll("li")];
      this.items = this.itemsElems.map((item, i) => new Item(item, this));
      window.addEventListener("resize", (e) => {
         this.setActive();
      });
      this.setActive(false);
   }
   setProgress(left, width) {
      this.wrapper.style.setProperty("--progress-left", left + "px");
      this.wrapper.style.setProperty("--progress-width", width + "px");
   }
   updateMarker(item, animated = true) {
      item.anim = anime({
         targets: this.marker,
         left: item.left,
         width: item.width,
         duration: animated ? 250 : 0,
         easing: "easeInOutSine",
         update: (anim) => {
            let currentLeft = parseFloat(anim.animations[0].currentValue);
            let currentWidth = parseFloat(anim.animations[1].currentValue);
            this.setProgress(currentLeft - 1, currentWidth);
         },
      });
   }
   get activeItem() {
      return this.items.find(({ active }) => active);
   }
   setActive(animated) {
      // let activeItem = this.activeItem;
      // if (activeItem) {
      //    this.wrapper.classList.add("has-active");
      //    this.setProgress(activeItem.left, activeItem.width);
      //    this.updateMarker(activeItem, animated);
      // } else {
      // }
      this.setProgress(0, 0);
   }
}

document.querySelectorAll("[data-solutions]").forEach((wrapper) => {
   new MarkerTabs(wrapper);
});
