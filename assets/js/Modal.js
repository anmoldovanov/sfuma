import is from "./helpers/is";
import upperFirst from "./helpers/upperFirst.js";
import camelToKebab from "./helpers/camelToKebab.js";
import cloneDeep from "./helpers/cloneDeep.js";
// import fragment from "./helpers/fragment.js";
import focusableElements from "./helpers/focusableElements.js";
import { getElement, toggleClass, attr, fragment, $ } from "./helpers/dom.js";
import Base from "./helpers/Base.js";
import sleep from "./helpers/sleep.js";

import collectAnimations from "./helpers/collectAnimations.js";
import updateStateClasses from "./helpers/updateStateClasses.js";

import { EventHandler } from "./helpers/event-handler";
const { on, off } = new EventHandler();

import { FocusTrap } from "./helpers/focusTrap";

// portal for nested modals
// lock / unlock
// transition as object
// appear
// awaiting only for Open / Close states

const MODAL = "modal";
const CONTENT = "content";
const BACKDROP = "backdrop";
const AJAX = "ajax";
const BODY = "body";
const ROOT = "root";
const ROOT_SELECTOR = "body";
const AUTOFOCUS = "autofocus";

const CONFIRM = "confirm";
const CANCEL = "cancel";

const DOM_ELEMENTS = [MODAL, BACKDROP, CONTENT];

const ACTION_TOGGLE = "toggle";
const ACTION_OPEN = "open";
const ACTION_CLOSE = "close";
const ACTION_CLOSE_SELF = "closeSelf";

const EVENT_INIT = "init";
const EVENT_DESTROY = "destroy";
const EVENT_BEFORE_SHOW = "beforeOpen";
const EVENT_OPEN = "open";
const EVENT_AFTER_OPEN = "afterOpen";
const EVENT_BEFORE_CLOSE = "beforeClose";
const EVENT_CLOSE = "close";
const EVENT_AFTER_CLOSE = "afterClose";
const EVENT_CLOSE_PREVENTED = "closePrevented";
const EVENT_FULL_OPENED = "fullOpen";
const EVENT_CONTENT_SET = "contentSet";
const EVENT_CONFIRM = CONFIRM;
const EVENT_CANCEL = CANCEL;

const EVENT_KEY_DOWN = "keydown";
const EVENT_CLICK = "click";
const EVENT_RIGHT_CLICK = "contextmenu";
const EVENT_FOCUS_IN = "focusin";

const ON_MODAL_KEY_DOWN = "_onModalKeyDown";
const ON_MODAL_CLICK = "_onModalClick";
const ON_MODAL_CONFIRM = "_onModalConfirm";
const ON_MODAL_CANCEL = "_onModalCancel";

const STATE_OPEN = EVENT_OPEN;
const STATE_CLOSE = "closed";
const STATE_CLOSE_PREVENTED = EVENT_CLOSE_PREVENTED;

const STATE_TRANSITION_FROM = "From";
const STATE_TRANSITION_TO = "To";
const STATE_TRANSITION_EMPTY = "";

const STATE_FULL_OPEN = "fullOpen";

const PREVENT_SCROLL = "preventScroll";

const PRIMARY_STATES = [STATE_OPEN, STATE_CLOSE];
const SECONDARY_STATES = [STATE_CLOSE_PREVENTED, STATE_FULL_OPEN];
const STATES = [...PRIMARY_STATES, ...SECONDARY_STATES];

const STATE_TRANSITION_ENTER_ACTIVE = "enterActive";
const STATE_TRANSITION_ENTER_FROM = "enterFrom";
const STATE_TRANSITION_ENTER_TO = "enterTo";
const STATE_TRANSITION_LEAVE_ACTIVE = "leaveActive";
const STATE_TRANSITION_LEAVE_FROM = "leaveFrom";
const STATE_TRANSITION_LEAVE_TO = "leaveTo";

const ARIA_LABELLEDBY = "ariaLabelledby";
const ARIA_DESCRIBEDBY = "ariaDescribedby";

const TYPE_CONFIRM = CONFIRM;
const TYPE_BASE = "";

const ON_MODAL_ANIMATION = "_onModalAnimation";
const ON_CONTENT_ANIMATION = "_onContentAnimation";
const ON_BACKDROP_ANIMATION = "_onBackdropAnimation";
const DOM_ANIMATIONS = {
   [MODAL]: ON_MODAL_ANIMATION,
   [CONTENT]: ON_CONTENT_ANIMATION,
   [BACKDROP]: ON_BACKDROP_ANIMATION,
};

const ARIA_SUFFIX = {
   [ARIA_LABELLEDBY]: `-title`,
   [ARIA_DESCRIBEDBY]: `-description`,
};

const BACKDROP_HTML = `<div class="modal-backdrop" data-${MODAL}-${BACKDROP}></div>`;
const CONTENT_HTML = `<div class="modal-content" data-${MODAL}-${CONTENT}></div>`;
const MODAL_HTML = `<div class="modal" data-${MODAL}>${BACKDROP_HTML + CONTENT_HTML}</div>`;

const body = document.body;

// ==========
// Helpers
// ==========

// updateBodyScrollbarWidth();

const updateBodyScrollbarWidth = (bodyScrollbarWidthVar) => {
   return getElement(":root").style.setProperty(bodyScrollbarWidthVar, window.innerWidth - body.offsetWidth + "px");
};

class Modal extends Base {
   static defaults = {
      ajax: {
         url: "",
         urlAttributes: "data-ajax-url,href",
         selector: "",
         _timeout: 0,
         clear: false,
      },

      // focus: {
      //    setAfterShow: true,
      //    autofocus: true,
      //    autofocusPreventScroll: true,
      // },
   };
   static defaultSettings = {
      closeOnEscape: true,
      escapeStopPropagation: true,
      clickStopPropagation: false,
      closeOnOverlayClick: true,
      returnFocusElem: null,
      returnFocusAfterHide: true,
      resetScroll: true,
      useFocusTrapping: true,
      useHiddenAttribute: true,
      bodyScrollbarWidthVar: "--body-scrollbar-width",
      updateBodyScrollbarWidthOnOpen: true,
      // awaitPreviousModal: true,
      closeable: true,
      openable: true,
      createOnOpen: false,
      removeOnClosed: false,
      destroyOnClosed: false,
      appendTarget: "body",
      portal: "body",
      setFocusAfterShow: true,
      autofocus: true,
      autofocusPreventScroll: true,
      autoOpen: true,
      preventScroll: true,
      preventScrollBeforeOpen: true,
      [ARIA_LABELLEDBY]: null,
      [ARIA_DESCRIBEDBY]: null,
      group: "",
      groupClosePrevious: true,
      backdropOutside: false,
      ariaLabelledby: false,
      ariaDescribedby: false,
      ariaRole: "dialog",
      type: TYPE_BASE,
      lazyInit: false,
      awaitingEvents: [],
      ajax: false,
      initialId: null,
      on: {},
      closeOnCancel: true,
      closeOnConfirm: false,
      initOpened: false,
      focusableElements,
      transitionName: "",
      render: {
         [MODAL]: MODAL_HTML,
         [BACKDROP]: BACKDROP_HTML,
      },
      selectors: {
         [MODAL]: `[data-${MODAL}]`,
         [CONTENT]: `[data-${MODAL}-${CONTENT}]`,
         [BACKDROP]: `[data-${MODAL}-${BACKDROP}]`,
         [AJAX]: `[data-${MODAL}-${AJAX}]`,
         [ACTION_TOGGLE]: `[data-${ACTION_TOGGLE}-${MODAL}="{id}"],[href="#{id}"]`,
         [ACTION_OPEN]: `[data-${ACTION_OPEN}-${MODAL}="{id}"]`,
         [ACTION_CLOSE]: `[data-${ACTION_CLOSE}-${MODAL}="{id}"]`,
         [ACTION_CLOSE_SELF]: `[data-${ACTION_CLOSE}-${MODAL}="{id}"],[data-${ACTION_CLOSE}-${MODAL}=""]`,
         [EVENT_CANCEL]: `[data-${MODAL}-${EVENT_CANCEL}]`,
         [EVENT_CONFIRM]: `[data-${MODAL}-${EVENT_CONFIRM}]`,
         [ARIA_LABELLEDBY]: `[data-${MODAL}${ARIA_SUFFIX[ARIA_LABELLEDBY]}]`,
         [ARIA_DESCRIBEDBY]: `[data-${MODAL}${ARIA_SUFFIX[ARIA_DESCRIBEDBY]}]`,
         [AUTOFOCUS]: `[data-autofocus],[autofocus]`,
      },
      classes: {
         [ROOT]: {
            [PREVENT_SCROLL]: `modal-prevent-scroll`,
            [STATE_OPEN]: `modal-{id}-open`,
         },
         toggler: {
            active: "modal-toggler-active",
         },
         loading: "modal--loading",
      },
      hooks: {},
   };
   static instances = new Map();
   get baseNode() {
      return this[MODAL];
   }
   static get NAME() {
      return MODAL;
   }
   constructor(elem, opts = {}) {
      super({ opts, elem });
      if (!elem) {
         return;
      }
      this.DOM = { [MODAL]: elem };

      this.group = this.opts.group;

      if (!this.opts.lazyInit) {
         this.init();
      }
   }
   init() {
      let initOpened = this.opts.initOpened;

      [CONTENT, BACKDROP, AJAX, CONFIRM, CANCEL].forEach((elemName) => {
         this.DOM[elemName] = this.find(this.getSelector(elemName));
      });

      this.awaitAjax = !!this.opts.ajax;

      this[ROOT] = getElement(ROOT_SELECTOR);

      attr(this[MODAL], {
         "aria-modal": true,
         "aria-hidden": !initOpened,
         role: this.opts.ariaRole,
         tabindex: -1,
      });

      this.states = {};
      this.promises = {};
      DOM_ELEMENTS.forEach((elemName) => {
         this.promises[elemName] = new Set();
         this.states[elemName] = {
            states: [STATE_CLOSE],
            animations: [],
         };
      });

      DOM_ELEMENTS.forEach((elemName) => {
         SECONDARY_STATES.forEach((stateName) => {
            let value = this[elemName]?.dataset[stateName];
            if (value) {
               this.opts.classes[elemName][stateName] += " " + value;
            }
         });
         this._setStateClasses(elemName, initOpened ? STATE_OPEN : STATE_CLOSE);
         this._setStateClasses(elemName, STATE_FULL_OPEN, initOpened);
      });

      this.updateAriaTargets();

      this.toggleHidden(CONTENT, !initOpened);
      this.toggleHidden(MODAL, !initOpened);

      [ON_MODAL_KEY_DOWN, ON_MODAL_CLICK, ON_MODAL_CONFIRM, ON_MODAL_CANCEL].forEach((h) => {
         this[h] = this[h].bind(this);
      });

      on(this[MODAL], EVENT_KEY_DOWN, this[ON_MODAL_KEY_DOWN]);
      on(this[MODAL], EVENT_CLICK, this[ON_MODAL_CLICK]);
      on(this[MODAL], EVENT_RIGHT_CLICK, this[ON_MODAL_CLICK]);

      on(body, EVENT_CLICK, (e) => {
         for (let action of [ACTION_TOGGLE, ACTION_OPEN, ACTION_CLOSE]) {
            let trigger = e.target.closest(this.getSelector(action));
            if (trigger) {
               e.preventDefault();
               // console.log(trigger);
               this[action]({ trigger });
            }
         }
      });

      this.instances.set(this.id, this);

      this.isOpen = initOpened;
      this.isInit = true;

      this._emit(MODAL, EVENT_INIT);

      if (this.opts.autoOpen && window.location.hash.substring(1) == this.id) {
         this[ACTION_OPEN]();
      }

      if (initOpened) {
         this.updateBodyScrollbarWidth();
         this._preventScroll(1);
         this.setFocusToFirstNode();
      }

      if (this.opts.portal) {
         getElement(this.opts.portal).insertAdjacentElement("beforeend", this[MODAL]);
      }

      this.focusTrap = new FocusTrap(this[MODAL]);

      if (!this.isOpen && this.opts.removeOnClosed) {
         this.remove();
      }

      return this;
   }
   destroy() {
      off([this[MODAL], body]);

      this.focusTrap.destroy();

      this.instances.delete(this.id);

      this._emit(MODAL, EVENT_DESTROY);

      return this;
   }
   get [MODAL]() {
      return this.DOM[MODAL];
   }
   get [CONTENT]() {
      return this.DOM[CONTENT];
   }
   get [BACKDROP]() {
      return this.DOM[BACKDROP];
   }
   get isAnimating() {
      return DOM_ELEMENTS.some((elemName) => this.promises[elemName].size);
   }
   get allowChangeBackdrop() {
      return !this.group || (this.group && this.groupModals.every(({ states, isOpen }) => !isOpen || !states[BACKDROP].states.includes(STATE_OPEN)));
   }
   get shownPreventScrollModals() {
      return this.shownModals.filter(({ opts }) => opts.preventScroll);
   }
   get groupModals() {
      return [...this.instances.values()].filter(({ group }) => group == this.group);
   }
   get shownModals() {
      return [...this.instances.values()].filter(({ isOpen }) => isOpen);
   }
   get latestShownModal() {
      return this.shownModals.pop();
   }
   get shownGroupModals() {
      return this.groupModals.filter(({ isOpen, group }) => group && isOpen);
   }
   get focusableNodes() {
      return this.findAll(this.opts.focusableElements).filter(({ offsetWidth }) => offsetWidth);
   }
   _callHook(name, defaultValue) {
      return this.opts.hooks[name]?.(this);
   }
   updateAriaTargets() {
      [ARIA_LABELLEDBY, ARIA_DESCRIBEDBY].forEach((name) => {
         let id = this.opts[name];
         if (!id) {
            const elem = this.find(this.getSelector(name));
            if (!elem) return;
            const checkId = (id, i = 1) => (document.getElementById(id) ? checkId(id + "-" + i, i++) : id);
            id = elem.id ||= checkId(this.id + ARIA_SUFFIX[name]);
         }
         this[MODAL].setAttribute(camelToKebab(name), id);
      });
      return this;
   }
   remove() {
      this[MODAL].remove();
      this.opts.backdropOutside && !this.shownModals.length && this[BACKDROP]?.remove();
      return this;
   }
   append(position = "beforeend", target = this.opts.appendTarget) {
      if (this.inDOM) return;
      getElement(target).insertAdjacentElement(position, this[MODAL]);
      this[BACKDROP] && this[MODAL].before(this[BACKDROP]);
      return this;
   }
   _repaintElem(elemName) {
      /* eslint-disable */
      this[elemName]?.offsetWidth;
      /* eslint-enable */
      return this;
   }
   createBackdrop() {
      // console.log(this.DOM[BACKDROP], this.group);
      if (this[BACKDROP] && body.contains(this[BACKDROP])) return;
      this[BACKDROP] = fragment(this.opts.render[BACKDROP]);

      (this.groupModals[0] || this)[MODAL].before(this[BACKDROP]);

      return this[BACKDROP];
   }
   _emit(elemName, eventName) {
      if (elemName == BACKDROP && !this.allowChangeBackdrop) return;
      const name = elemName == MODAL ? eventName : elemName + upperFirst(eventName);

      // console.log(name);
      // _callHook
      this._callHook(name);
      this[MODAL].dispatchEvent(new CustomEvent(name, { detail: { modal: this } }));
      // if (checkElementAnimation) {
      //    return this._checkElementAnimation(elemName, eventName);
      // }
      return this;
   }

   toggleHidden(elemName, s) {
      let elem = this[elemName];
      if (!elem || (elemName == BACKDROP && !this.allowChangeBackdrop)) return;
      attr(elem, "aria-hidden", !!s);
      this.opts.useHiddenAttribute && (elem.hidden = s);
   }
   replaceTags(selector = "") {
      return selector.replaceAll("{id}", this.id);
   }
   getSelector(name) {
      return this.replaceTags(this.opts.selectors[name]);
   }
   getClasses(elemName, state) {
      return this.replaceTags(state ? this.opts.classes[elemName][state] : this.opts.classes[elemName]);
   }
   returnFocus() {
      if (this.opts.useFocusTrapping) {
         this.focusTrap.stop();
      }
      this.returnFocusElem?.focus({ preventScroll: true });
   }
   setFocusToFirstNode() {
      if (!this.opts.setFocusAfterShow) return;

      let focusableNodes = this.focusTrap.focusableNodes;
      if (this.opts.useFocusTrapping) {
         this.focusTrap.start();
      }

      // if (this.opts.useFocusTrapping) {
      //    on(body, EVENT_FOCUS_IN, () => {
      //       if (!this[MODAL].contains(document.activeElement) && this.latestShownModal == this) {
      //          this.focusTrap.focusFirst();
      //       }
      //       this.focusTrap.start();
      //    });
      // }
      if (this[MODAL].contains(document.activeElement)) return;

      let elem = focusableNodes[0];
      if (this.opts.autofocus) {
         elem = this.find(this.getSelector(AUTOFOCUS)) || elem;
      }
      elem?.focus({ preventScroll: this.opts.autofocusPreventScroll });
   }

   _preventScroll(s) {
      let hasPreventScrollModals = this.shownPreventScrollModals.length;
      if ((s && hasPreventScrollModals) || (!s && !hasPreventScrollModals)) {
         this._toggleClass(ROOT, PREVENT_SCROLL, s);
      }
   }
   async [ACTION_TOGGLE](s, { checkPrevent = true, trigger = null } = {}) {
      let { opts, isOpen } = this;

      s = !!(s ?? !isOpen);

      if (s) {
         this.trigger = trigger;
      }

      if (this.isAnimating || s === isOpen) return;

      if (opts.updateBodyScrollbarWidthOnOpen && s && !this.shownModals.some(({ opts }) => opts.preventScroll)) {
         this.updateBodyScrollbarWidth();
      }

      if (s && opts.ajax) {
         this.awaitAjax = true;
         toggleClass(this[MODAL], this.opts.classes.loading, true);
         if (!opts.ajax.url && trigger) {
            for (let attrName of opts.ajax.urlAttributes.split(",")) {
               opts.ajax.url ||= trigger.getAttribute(attrName)?.trim();
               if (opts.ajax.url) {
                  break;
               }
            }
         }
      }

      this._emit(MODAL, s ? EVENT_BEFORE_SHOW : EVENT_BEFORE_CLOSE);
      await this._checkElementAnimation(MODAL, s ? EVENT_BEFORE_SHOW : EVENT_BEFORE_CLOSE);

      if (s && !opts.openable) return;

      if (s) {
         opts.createOnOpen && this.append();
         if (opts.backdropOutside && this.allowChangeBackdrop) {
            this.createBackdrop();
         } else if (this.shownGroupModals.length) {
            this[BACKDROP] = this.shownGroupModals[0][BACKDROP];
         }
      }

      if (checkPrevent && !s && /*!opts.closeable &&*/ this._callHook("preventClose")) {
         await Promise.allSettled(
            DOM_ELEMENTS.map((elemName) => {
               this._emit(elemName, EVENT_CLOSE_PREVENTED);
               this._setStateClasses(elemName, STATE_CLOSE_PREVENTED);
               return this._checkElementAnimation(elemName, EVENT_CLOSE_PREVENTED);
            })
         );
         for (let elemName of DOM_ELEMENTS) {
            this._setStateClasses(elemName, STATE_CLOSE_PREVENTED, 0);
         }
         return this;
      }

      toggleClass(this.trigger, trigger?.dataset.modalOpenClass ?? opts.classes.toggler.active, s);

      this._toggleClass(ROOT, STATE_OPEN, s);

      if (s && this.group && opts.groupClosePrevious) {
         this.shownGroupModals.forEach((modal) => modal.close());
      }

      this.isOpen = s;

      if (s) {
         opts.preventScrollBeforeOpen && this._preventScroll(s);
         this.returnFocusElem = opts.returnFocusElem ?? document.activeElement;
         for (let elemName of [MODAL, BACKDROP]) {
            this._emit(elemName, EVENT_OPEN);
            this._setTransitionStateClasses(elemName, STATE_TRANSITION_FROM);
            this.toggleHidden(elemName, 0);
            if (this.opts.resetScroll) {
               this.scrollTo(elemName);
            }
            this._repaintElem(elemName);
            this._setTransitionStateClasses(elemName, STATE_TRANSITION_TO);
            this._setStateClasses(elemName, STATE_OPEN);
            await this._checkElementAnimation(elemName, EVENT_OPEN);

            this[DOM_ANIMATIONS[elemName]](EVENT_OPEN);
         }
         !opts.preventScrollBeforeOpen && this._preventScroll(s);
      } else {
         this._toggleContent(false);
      }

      if (opts.type == TYPE_CONFIRM) {
         on(this[MODAL], EVENT_CONFIRM, this[ON_MODAL_CONFIRM]);
         on(this[MODAL], EVENT_CANCEL, this[ON_MODAL_CANCEL]);
         return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
         });
      }

      if (opts.ajax?.url && opts.ajax?.selector) {
         await this.fetchAjaxContent();
      }

      // if (this.group && !this.shownGroupModals.length) {
      //    this.groupModals.forEach((modal) => {
      //       modal[BACKDROP + "Shown"] = false;
      //    });
      // }

      return this;
   }
   async [ACTION_OPEN](params) {
      return this[ACTION_TOGGLE](1, params);
   }
   async [ACTION_CLOSE](params) {
      return this[ACTION_TOGGLE](0, params);
   }

   async _toggleContent(s) {
      if (s && this.awaitAjax) {
         await new Promise((resolve) => {
            this.ajaxDonePromise = resolve;
         });
      }
      this.ajaxDonePromise = null;

      this._emit(CONTENT, s ? EVENT_OPEN : EVENT_CLOSE);

      if (!s) {
         this._setStateClasses(MODAL, STATE_FULL_OPEN, 0);
      }
      this._setTransitionStateClasses(CONTENT, STATE_TRANSITION_FROM);

      s && this.toggleHidden(CONTENT, 0);

      if (s && this.opts.resetScroll) {
         this.scrollTo(CONTENT);
      }

      this._repaintElem(CONTENT);

      this._setTransitionStateClasses(CONTENT, STATE_TRANSITION_TO);
      this._setStateClasses(CONTENT, s ? STATE_OPEN : STATE_CLOSE);
      await this._checkElementAnimation(CONTENT, s ? EVENT_OPEN : EVENT_CLOSE);

      await this[DOM_ANIMATIONS[CONTENT]](s ? EVENT_OPEN : EVENT_CLOSE);

      if (!s && this.opts.ajax && this.opts.ajax.clear && this[AJAX]) {
         this.DOM[AJAX].innerHTML = "";
      }
   }
   _setFinishState(elemName, s) {
      return Promise.allSettled(this.promises[elemName].values()).then((_) => {
         // this._setStateClasses(elemName, s ? STATE_OPENED : STATE_CLOSED);
         this._emit(elemName, s ? EVENT_AFTER_OPEN : EVENT_AFTER_CLOSE);
      });
   }
   [ON_MODAL_ANIMATION]() {
      const s = this.isOpen;
      this._setFinishState(MODAL, s).then((_) => {
         if (!s) {
            this.opts.destroyOnClosed && this.destroy();
            this.opts.removeOnClosed && this.remove();
         }
      });
   }
   [ON_BACKDROP_ANIMATION]() {
      const s = this.isOpen;
      this._setFinishState(BACKDROP, s);
      if (s) {
         this._toggleContent(true);
         if (this.states[CONTENT].states.includes(STATE_OPEN) && !this[CONTENT].contains(document.activeElement)) {
            this.setFocusToFirstNode();
         }
      }
   }
   async [ON_CONTENT_ANIMATION]() {
      const s = this.isOpen;

      // s && this.setFocusToFirstNode();

      this._setFinishState(CONTENT, s).then((_) => (s ? this.setFocusToFirstNode() : this._preventScroll(s)));

      if (!s) {
         this.opts.returnFocusAfterHide && this.returnFocus();

         for (let elemName of [BACKDROP, MODAL]) {
            this._emit(elemName, EVENT_CLOSE);
            this._setTransitionStateClasses(elemName, STATE_TRANSITION_FROM);
            this._repaintElem(elemName);
            this._setTransitionStateClasses(elemName, STATE_TRANSITION_TO);
            this._setStateClasses(elemName, STATE_CLOSE);
            await this._checkElementAnimation(elemName, EVENT_CLOSE);

            this[DOM_ANIMATIONS[elemName]](EVENT_CLOSE);
         }
      } else {
         await Promise.allSettled(
            DOM_ELEMENTS.map((elemName) => {
               return Promise.allSettled(this.promises[elemName].values()).then((_) => {
                  elemName == MODAL && this._setStateClasses(MODAL, STATE_FULL_OPEN);
               });
            })
         );
         this._emit(MODAL, EVENT_FULL_OPENED, true);
      }
   }
   _checkElementAnimation(elemName, eventName) {
      const elem = this[elemName];
      if (!elem) return;
      let promises = this.promises[elemName];

      collectAnimations.call(this, {
         elem,
         promises,
         eventName,
      });

      const setEmpty = () => {
         eventName == EVENT_CLOSE && this.toggleHidden(elemName, 1);
         this._setTransitionStateClasses(elemName, STATE_TRANSITION_EMPTY);
         promises.clear();
      };

      promises.size ? Promise.allSettled(promises.values()).then(setEmpty) : setEmpty();
      return [...promises][0];
   }
   scrollTo(elemName, left = 0, top = 0, smooth = false) {
      let elem = this[elemName];
      if (!elem) return;
      if (!smooth) {
         elem.style.scrollBehavior = "auto";
      }
      elem.scrollTo({ left, top, smooth: smooth ? "auto" : "smooth" });
      if (!smooth) {
         elem.style.scrollBehavior = "";
      }
   }
   _updateElemClasses(elemName) {
      updateStateClasses.call(this, { elem: this[elemName], states: this.states[elemName], STATES, elemName });
   }
   _setTransitionStateClasses(elemName, stateType) {
      if (!this[elemName]) return;
      let names = [];
      if (stateType) {
         names =
            stateType == STATE_TRANSITION_FROM
               ? [this.isOpen ? STATE_TRANSITION_ENTER_FROM : STATE_TRANSITION_LEAVE_FROM]
               : this.isOpen
               ? [STATE_TRANSITION_ENTER_ACTIVE, STATE_TRANSITION_ENTER_TO]
               : [STATE_TRANSITION_LEAVE_ACTIVE, STATE_TRANSITION_LEAVE_TO];
      }
      this.states[elemName].animations = names;
      this._updateElemClasses(elemName);
   }
   _setStateClasses(elemName, state, s = true) {
      if (!this[elemName] || (state !== STATE_OPEN && elemName == BACKDROP && !this.allowChangeBackdrop)) return;

      const updateStates = ({ states }, s) => {
         states = states[elemName];
         states.states = s ? (PRIMARY_STATES.includes(state) ? [state] : [...states.states, state]) : states.states.filter((s) => s !== state);
      };
      if (elemName == BACKDROP && this.group) {
         this.groupModals.forEach((modal) => updateStates(modal, s));
      } else {
         updateStates(this, s);
      }

      this._updateElemClasses(elemName);
   }
   _toggleClass(elemName, state, s) {
      toggleClass(this[elemName], this.getClasses(elemName, state), s);
   }

   [ON_MODAL_CLICK](e) {
      this.opts.clickStopPropagation && e.stopPropagation();

      if (!this[CONTENT].contains(e.target) && this.opts.closeOnOverlayClick) {
         this[ACTION_CLOSE](true);
      }

      for (let event of [EVENT_CANCEL, EVENT_CONFIRM]) {
         if (e.target.closest(this.getSelector(event))) {
            return this._emit(MODAL, event);
         }
      }
      if (e.target.closest(this.getSelector(ACTION_CLOSE_SELF))) {
         this[ACTION_CLOSE]();
      }
   }
   [ON_MODAL_KEY_DOWN](e) {
      const shownModals = this.shownModals;
      if (e.key === "Escape" && this.opts.closeOnEscape && shownModals[shownModals.length - 1] == this) {
         this.opts.escapeStopPropagation && e.stopPropagation();
         this[ACTION_CLOSE](true);
      }
   }
   [ON_MODAL_CONFIRM]() {
      this._resolve(true);
      // this[ACTION_CLOSE]();
   }
   [ON_MODAL_CANCEL]() {
      this._resolve(false);
      this[ACTION_CLOSE]();
   }
   async fetchAjaxContent() {
      if (this.opts.ajax._timeout) {
         await sleep(this.opts.ajax._timeout);
      }
      let res = await fetch(this.opts.ajax.url);
      res = await res.text();
      if (this.isOpen) {
         this.setContent(fragment(res, this.opts.ajax.selector)[0]);
      }
   }
   ajaxDone() {
      this.awaitAjax = false;
      toggleClass(this[MODAL], this.opts.classes.loading, false);
      this.ajaxDonePromise?.();
   }
   setContent(html, ajaxDone = true) {
      let ajaxElem = this.DOM[AJAX];
      if (ajaxElem) {
         ajaxElem.innerHTML = "";
         if (typeof html == "String") {
            ajaxElem.innerHTML = html;
         } else {
            ajaxElem.append(html);
         }
         this.updateAriaTargets();
         ajaxDone && this.ajaxDone();
         this._emit(MODAL, EVENT_CONTENT_SET);
         return ajaxElem.firstChild;
      }
   }
   updateBodyScrollbarWidth() {
      updateBodyScrollbarWidth(this.opts.bodyScrollbarWidthVar);
   }
   static updateBodyScrollbarWidth() {
      updateBodyScrollbarWidth();
   }
   static async [ACTION_OPEN](id, params) {
      return this.instances.get(id)?.[ACTION_OPEN](params);
   }
   static async [ACTION_CLOSE](id, params) {
      return this.instances.get(id)?.[ACTION_CLOSE](params);
   }

   static updateDefaultClasses(obj) {
      for (const elemName of Object.keys(obj)) {
         for (const [state, value] of Object.entries(obj[elemName])) {
            const classes = is.object(value) ? value.classes : value;
            const replace = is.object(value) ? value.replace : false;
            this.defaultSettings.classes[elemName][state] = replace ? classes : defaultSettings.classes[elemName][state] + " " + classes.trim();
         }
      }
      return this.defaultSettings.classes;
   }
   static create(html, opts = {}) {
      opts = cloneDeep({ ...this.defaultSettings, ...opts });
      let modalElem = fragment(html || this.defaultSettings.render[MODAL](opts));
      let modal = new Modal(modalElem, opts);
      if (!modal.opts.createOnOpen) {
         modal.append();
      }
      return modal;
   }
}

// DOM_ELEMENTS.forEach((elemName) => {
//    Modal.defaultSettings.classes[elemName] ||= {};
//    for (let state of STATES) {
//       Modal.defaultSettings.classes[elemName][state] = `${elemName == MODAL ? MODAL : `${MODAL}-${elemName}`}--${camelToKebab(state)}`;
//    }
// });

export default Modal;
