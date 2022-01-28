import upperFirst from "./helpers/upperFirst.js";
import camelToKebab from "./helpers/camelToKebab.js";
import cloneDeep from "./helpers/cloneDeep.js";

import toMs from "./helpers/toMs.js";
import { getElement, getElements, toggleClass, attr } from "./helpers/dom.js";
import Base from "./helpers/Base.js";
import focusableElements from "./helpers/focusableElements.js";

import collectAnimations from "./helpers/collectAnimations.js";
import updateStateClasses from "./helpers/updateStateClasses.js";

import { EventHandler } from "./helpers/event-handler";
const { on, off } = new EventHandler();

const DROPDOWN = "dropdown";

const EVENT_INIT = "init";
const EVENT_DESTROY = "destroy";
const EVENT_BEFORE_OPEN = "beforeOpen";
const EVENT_OPEN = "open";
const EVENT_OPENED = "opened";
const EVENT_BEFORE_CLOSE = "beforeClose";
const EVENT_CLOSE = "close";
const EVENT_CLOSED = "closed";

const STATE_OPEN = EVENT_OPEN;
const STATE_OPENED = EVENT_OPENED;
const STATE_CLOSE = EVENT_CLOSE;
const STATE_CLOSED = EVENT_CLOSED;

const STATES = [STATE_OPEN, STATE_OPENED, STATE_CLOSE, STATE_CLOSED];

const STATE_TRANSITION_ENTER_ACTIVE = "enterActive";
const STATE_TRANSITION_ENTER_FROM = "enterFrom";
const STATE_TRANSITION_ENTER_TO = "enterTo";
const STATE_TRANSITION_LEAVE_ACTIVE = "leaveActive";
const STATE_TRANSITION_LEAVE_FROM = "leaveFrom";
const STATE_TRANSITION_LEAVE_TO = "leaveTo";

const updateBodyScrollbarWidth = (bodyScrollbarWidthVar) => {
   return getElement(":root").style.setProperty(bodyScrollbarWidthVar, window.innerWidth - document.body.offsetWidth + "px");
};

let togglers = {};
let togglesGroups = {};
// let closeOnEscapeElems = [];

class Dropdown extends Base {
   static defaultSettings = {
      closeOnEscape: false,
      setFocus: false,
      showOnHover: false,
      hoverContainer: false,
      setHash: false,
      setHeight: true,
      // toggleDisplay: true,
      useHiddenAttribute: true,
      closeOnClick: false,
      scrollToStartOnClose: false,
      scrollYOffset: 0,
      globalClassTarget: "body",
      activeClass: "active",
      heightElem: "[data-dropdown-height]",
      hoverDelay: 200,
      matchMedia: "",
      on: {},
      awaitingEvents: [],
      bodyScrollbarWidthVar: "--body-scrollbar-width",
      //focusElems: 'button,a,input,textarea',
      // onOpen: function () {},
      // onClose: function () {},
      selectors: {
         dropdown: `[data-dropdown]`,
      },
   };
   static instances = new Map();
   get baseNode() {
      return this.dropdown;
   }
   static get NAME() {
      return DROPDOWN;
   }
   constructor(target, opts = {}) {
      super({ opts, elem: target });
      if (!target) return;
      this.dropdown = target;

      this.togglers = opts.togglers || getElements('[data-toggle="' + this.id + '"]');

      this.promises = new Set();

      this.actionArea = opts.actionArea;
      if (!this.actionArea) {
         if (this.dropdown.querySelector(`[data-action-area=""],[data-action-area="${this.id}"]`)) {
            this.actionArea = "[data-action-area]";
         } else {
            this.actionArea = ":root";
         }
      }

      this.states = { states: [], animations: [] };

      this.globalClassTargetElem = getElement(this.opts.globalClassTarget);

      if (this.opts.showOnHover) {
         this.opts.hoverContainer = this.opts.hoverContainer ? getElement(this.opts.hoverContainer) : this.dropdown.parentNode;
      }

      if (!this.opts.matchMedia) {
         this.init();
      } else {
         let mqChange = (mq) => (mq.matches ? this.init() : this.destroy());
         let mq = window.matchMedia(this.opts.matchMedia);
         mq.addEventListener("change", mqChange);
         mqChange(mq);
      }
   }
   init() {
      this._setDropdowns();

      if (this.togglers.length) {
         this.dropdown.setAttribute("aria-labelledby", this.togglers[0].id);
      }

      this.dropdown.classList.contains(this.opts.activeClass) ? this.open() : this.close();

      // document.addEventListener("keydown", (e) => {
      //    if (e.keyCode === 9) this.maintainFocus(e);
      // });

      this._events = {};

      togglers[this.id] = this;
      this.init = true;
   }

   _scrollToStart() {
      if (!this.opts.scrollToStartOnClose) return;
      const y = this.dropdown.getBoundingClientRect().top + window.pageYOffset - this.opts.scrollYOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
   }
   _setDropdowns() {
      this.togglers.forEach((toggler) => {
         toggler.id = toggler.id || "toggler-" + Math.random().toString(36).substring(2, 9);

         toggler.setAttribute("aria-controls", this.id);

         on(toggler, "click", (e) => {
            e.preventDefault();
            this.dropdown.classList.contains(this.opts.activeClass) ? this.close(e) : this.open(e);
         });

         if (this.opts.showOnHover) {
            let timeout;
            let leaveTimeout;
            on(toggler, "mouseenter", (e) => {
               if (this.isOpen) return;

               clearTimeout(timeout);

               timeout = setTimeout(() => {
                  if (!toggler.matches(":hover")) return;

                  this.opts.hoverContainer.classList.add("container-has-hover");

                  on(this.opts.hoverContainer, "mouseleave", (e) => {
                     clearTimeout(leaveTimeout);
                     leaveTimeout = setTimeout(() => {
                        if (this.opts.hoverContainer.matches(":hover")) return;
                        this.close(e);
                        this.opts.hoverContainer.classList.remove("container-has-hover");
                     }, this.opts.hoverDelay);
                  });
                  this.open(e);
               }, this.opts.hoverDelay);
            });
         }
      });
   }
   _toggleAttributes(s) {
      let target = this.dropdown;

      target.classList.toggle(this.opts.activeClass, s);
      // this.opts.toggleDisplay && target.setAttribute("aria-hidden", !s);
      // !this.opts.toggleDisplay && target.setAttribute("aria-expanded", s);

      this.togglers.forEach((elem) => {
         elem.classList.toggle(this.opts.activeClass, s);
         if (elem.nodeName !== "BUTTON") {
            elem.setAttribute("role", "button");
         }
         //elem.attr('aria-expanded', s)
      });

      this.globalClassTargetElem.classList.toggle(this.id + "-active", s);

      if (!s) {
         target.classList.remove("animation-from-next", "animation-from-prev", "is-prev-elem");
         if (this.opts.hoverContainer) {
            this.opts.hoverContainer.classList.remove("container-has-hover");
         }
      }
   }
   _setHeight() {
      [...getElements("[data-dropdown-height]"), this.dropdown].forEach((elem) => {
         elem.style.height = "auto";
         let height = elem.scrollHeight;
         elem.style.height = "";
         elem.style.setProperty("--height", height + "px");

         if (this.opts.hoverContainer) {
            this.opts.hoverContainer?.style.setProperty("--dropdown-height", height + "px");
         }
      });
   }
   getFocusableNodes() {
      return getElements(focusableElements, this.dropdown);
   }

   setFocusToFirstNode() {
      if (this.config.disableFocus) return;
      const focusableNodes = this.getFocusableNodes();
      if (focusableNodes.length) focusableNodes[0].focus();
   }

   maintainFocus(event) {
      const focusableNodes = this.getFocusableNodes(); // if disableFocus is true
      if (!this.dropdown.contains(document.activeElement)) {
         focusableNodes[0].focus();
      } else {
         const focusedItemIndex = focusableNodes.indexOf(document.activeElement);
         if (event.shiftKey && focusedItemIndex === 0) {
            focusableNodes[focusableNodes.length - 1].focus();
            event.preventDefault();
         }
         if (!event.shiftKey && focusedItemIndex === focusableNodes.length - 1) {
            focusableNodes[0].focus();
            event.preventDefault();
         }
      }
   }

   _toggleHash(s) {
      if (!this.opts.setHash) return;

      if (s) {
         return history.pushState({}, "", "#" + this.dropdown.id);
      }

      if (window.location.hash == "#" + this.dropdown.id) {
         return history.replaceState({}, "", window.location.href.split("#")[0]);
      }
   }
   async toggle(s, silent) {
      if (!this.init) return;

      if (s) {
         this.activeElement = document.activeElement;
         updateBodyScrollbarWidth(this.opts.bodyScrollbarWidthVar);
         this.toggleHidden(false);
      }

      this.dropdown.offsetWidth;
      if (this.opts.setHeight) this._setHeight();

      this.states = {
         states: [s ? STATE_OPEN : STATE_CLOSE],
         animations: [s ? STATE_TRANSITION_ENTER_ACTIVE : STATE_TRANSITION_LEAVE_ACTIVE, s ? STATE_TRANSITION_ENTER_TO : STATE_TRANSITION_LEAVE_TO],
      };
      this._updateElemClasses();

      !silent && this._emit(s ? STATE_OPEN : STATE_CLOSE);
      await this._checkAnimation(s ? STATE_OPEN : STATE_CLOSE);

      if (s) {
         on(document.body, "click", (e) => {
            if (this.opts.closeOnClick) return this.close();
            if (!e.target.closest(`[data-toggle="${this.id}"], ${this.actionArea}`) || e.target.closest(`#${this.id} [data-close]`)) {
               this.close();
            }
         });
      }

      if (!s) {
         this.toggleHidden(true);
         this._scrollToStart();
         this.opts.setFocus && this.setFocusToFirstNode();
         off(document.body);
      }

      this._toggleAttributes(s);
      this._toggleHash(s);

      //this.activeElement && this.activeElement.focus()
      this.isOpen = s;
      this.states = {
         states: [s ? STATE_OPENED : STATE_CLOSED],
         animations: [],
      };
      this._updateElemClasses();
      !silent && this._emit(s ? EVENT_OPENED : EVENT_CLOSED);
   }
   open(silent) {
      return this.toggle(true, silent);
   }
   close(silent) {
      return this.toggle(false, silent);
   }

   _updateElemClasses() {
      updateStateClasses.call(this, { elem: this.dropdown, states: this.states, STATES });
   }

   static get(id) {
      return togglers[id];
   }
   static close(id) {
      togglers[id]?.close();
   }
   static open(id) {
      togglers[id]?.open();
   }
   static getGroup(id) {
      return togglesGroups[id];
   }
   // static initAll() {
   //    getElements("[data-dropdown]").forEach((target) => new Dropdown(target));
   // }
   _checkAnimation(eventName) {
      collectAnimations.call(this, { elem: this.dropdown, promises: this.promises, eventName });
      if (this.promises.size) {
         return Promise.allSettled(this.promises.values()).then(() => this.promises.clear());
      }
   }

   toggleHidden(s) {
      attr(this.baseNode, "aria-hidden", !!s);
      this.opts.useHiddenAttribute && (this.baseNode.hidden = s);
   }

   destroy() {
      removeAttr(this.dropdown, "aria-hidden aria-expanded");
      this.opts.toggleDisplay && (this.dropdown.style.display = "");
      removeAttr(this.togglers, "aria-controls aria-expanded");
      this.dropdown.classList.remove(this.opts.activeClass, "animation-from-next", "animation-from-prev", "is-prev-elem");
      if (this.opts.hoverContainer) {
         this.opts.hoverContainer.classList.remove("container-has-hover");
      }
      this.init = false;
   }
}

// document.addEventListener("keyup", (e) => {
//    if (e.keyCode == 27 && closeOnEscapeElems.length) {
//       closeOnEscapeElems.pop().close();
//    }
// });

export default Dropdown;
