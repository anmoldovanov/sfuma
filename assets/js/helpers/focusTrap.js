import focusableElements from "./focusableElements.js";
import { EventHandler } from "./event-handler";
import { findAndRemove } from "./utils";

const { on, off } = new EventHandler();

const traps = [];
const activeTraps = [];

export class FocusTrap {
   constructor(elem) {
      // if (e.key === "Tab") this.maintainFocus(e);
      this.elem = elem;
      traps.push(this);
      activeTraps.push(this);
   }
   get focusableNodes() {
      return [...this.elem.querySelectorAll(focusableElements)].filter(({ offsetWidth }) => offsetWidth);
   }
   start() {
      this.active = true;
      on(document, "focusin", () => {
         if (!this.elem.contains(document.activeElement)) {
            this.focusTrap.focusFirst();
         }
      });
      on(this.elem, "keydown", (e) => {
         if (e.key !== "Tab") return;
         let focusableNodes = this.focusableNodes;
         const first = focusableNodes[0];
         const last = focusableNodes[focusableNodes.length - 1];
         if (!this.elem.contains(document.activeElement)) {
            first?.focus();
         } else {
            const active = focusableNodes.find((elem) => elem == document.activeElement);
            if (e.shiftKey && active == first) {
               last?.focus();
               e.preventDefault();
            }
            if (!e.shiftKey && active == last) {
               first?.focus();
               e.preventDefault();
            }
         }
      });
   }
   stop() {
      this.active = false;
      off([this.elem, document]);
      findAndRemove(activeTraps, this);
   }
   focusFirst() {
      this.focusableNodes[0]?.focus();
   }
   destroy() {
      this.stop();
      findAndRemove(traps, this);
   }
}
