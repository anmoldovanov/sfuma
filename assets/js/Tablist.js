"use strict";

import focus from "./helpers/focus.js";
import isElemDisabled from "./helpers/isElemDisabled.js";
import toggleElemDisabled from "./helpers/toggleElemDisabled.js";
import focusableElements from "./helpers/focusableElements.js";
import { getElement, getElements, toggleClass, attr, removeAttr } from "./helpers/dom.js";
import Base from "./helpers/Base.js";

import collectAnimations from "./helpers/collectAnimations.js";
import updateStateClasses from "./helpers/updateStateClasses.js";

import { EventHandler } from "./helpers/event-handler";
const { on, off } = new EventHandler();

// leazy loading tabs
// leazy disable
// open tab by id

// Constants

const TABLIST = "tablist";
const TAB = "tab";
const TABPANEL = "tabpanel";
const ITEM = "item";

const AUTOFOCUS = "autofocus";

const TAB_ELEMS = [ITEM, TAB, TABPANEL];

const ROLE = "role";
const TABINDEX = "tabindex";
const ARIA_MULTISELECTABLE = "aria-multiselectable";
const ARIA_CONTROLS = "aria-controls";
const ARIA_SELECTED = "aria-selected";
const ARIA_LABELLEDBY = "aria-labelledby";
const ARIA_EXPANDED = "aria-expanded";
const ARIA_HIDDEN = "aria-hidden";
const HIDDEN = "hidden";

const EVENT_FOCUS_OUT = "focusout";
const EVENT_FOCUS_IN = "focusin";
const EVENT_KEY_DOWN = "keydown";
const EVENT_KEY_DOWN_ESCAPE = EVENT_KEY_DOWN + ".escape";
const EVENT_CLICK = "click";
const EVENT_FOCUS = "focus";

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

const ON_TAB_FOCUS = "_onTabFocus";
const ON_TAB_KEYDOWN = "_onTabKeydown";
const ON_TABLIST_KEYDOWN = "_onTablistKeydown";
const ON_TABLIST_FOCUS_OUT = "_onTablistFocusOut";
const ON_TAB_CLICK = "_onTabClick";
const ON_TABPANEL_CLICK = "_onTabpanelClick";
const ON_BODY_CLICK = "_onBodyClick";
// const ON_BODY_FOCUS_IN = "_onBodyFocusIn";

class Tablist extends Base {
   static defaultSettings = {
      allowAllClosed: true,
      multiExpand: false,
      useHiddenAttribute: true,
      siblingPanel: true,
      tabpanelsGroup: "",
      keyboardNavigation: true,
      awaiteTabpanelAnimation: false,
      awaitePreviousTabpanel: false,
      events: {},
      lazyInit: false,
      transitionName: "",
      awaitingEvents: [],
      mediaQuery: "",
      closeOnClickAway: false,
      // focusAfterShow: false, // !
      // focusTrapping: false,
      autofocus: false,
      autofocusInit: false,
      dataAutofocus: true,
      returnFocusAfterHide: true,
      closeOnEscape: false,
      escapeStopPropagation: true,
      arrowActivation: false,
      hashOpen: true,
      eventsSuffix: "",
      focusableElements,
      rtl: false,
      events: {},
      on: {},
      roles: {
         [TABLIST]: TABLIST,
         [TAB]: TAB,
         [TABPANEL]: TABPANEL,
         [ITEM]: "presentation",
      },
      classes: {
         [TAB]: {
            active: "active",
         },
         [TABPANEL]: {
            active: "active",
         },
         [ITEM]: {
            active: "active",
         },
      },
      selectors: {
         [TABLIST]: `[data-${TABLIST}]`,
         [TAB]: `[data-${TABLIST}-${TAB}]`,
         [TABPANEL]: `[data-${TABLIST}-${TABPANEL}]`,
         [ITEM]: `[data-${TABLIST}-${ITEM}]`,
         close: `[data-${TABLIST}-close]`,
      },
   };
   static instances = new Map();
   get baseNode() {
      return this[TABLIST];
   }
   static get NAME() {
      return TABLIST;
   }
   constructor(elem, opts = {}) {
      elem = getElement(elem);
      super({ opts, elem });
      if (!elem) {
         return;
      }
      this[TABLIST] = elem;

      if (this.opts.tabpanelsGroup) {
         this.tabpanelsGroup = document.getElementById(this.opts.tabpanelsGroup);
      }

      this.tabs = [];

      this.mediaQuery = this.opts.mediaQuery && window.matchMedia(this.opts.mediaQuery);
      if (this.mediaQuery) {
         this.mediaQuery.addEventListener("change", this.checkMediaQuery.bind(this));
         this.checkMediaQuery();
      } else {
         this.init();
      }
   }
   checkMediaQuery() {
      this.mediaQuery.matches ? this.init() : this.destroy();
   }
   init() {
      if (this.isInit) return;
      const tablist = this[TABLIST];

      this.tablist.id = this.id;

      this.opts.roles && attr(tablist, ROLE, this.opts.roles[TABLIST]);
      this.opts.multiExpand && attr(tablist, ARIA_MULTISELECTABLE, true);

      [ON_TAB_FOCUS, ON_TAB_KEYDOWN, ON_TAB_CLICK, ON_TABPANEL_CLICK].forEach((h) => (this[h] = this[h].bind(this)));

      on(tablist, EVENT_FOCUS_OUT, this._updateTabindex.bind(this));
      getElements(`:scope ${this.opts.selectors[TAB]}`, tablist).forEach((tab) => {
         if (tab.closest(this.opts.selectors[TABLIST])?.id === this.id) this.initTab(tab);
      });

      this.instances.set(this.id, this);

      this._updateTabindex();

      this.isInit = true;

      if (!this.opts.allowAllClosed && !this.selected.length) {
         this.tabs[0].open();
      }

      this._emit(EVENT_INIT, this);
   }
   destroy() {
      if (!this.isInit) return;

      const { tablist, tabs, opts, UIDBase } = this;

      removeAttr(tablist, [ROLE, ARIA_MULTISELECTABLE]);
      tablist.id.includes(UIDBase) && (tablist.id = "");
      off([tablist, body]);
      tabs.forEach((tabObj) => {
         const { tab, item, tabpanel, initActive } = tabObj;

         removeAttr(tab, [ROLE, TABINDEX, ARIA_CONTROLS, ARIA_SELECTED]);
         removeAttr(tabpanel, [ROLE, ARIA_LABELLEDBY, ARIA_EXPANDED, ARIA_HIDDEN, HIDDEN]);
         removeAttr(item, [ROLE]);

         tab.id.includes(UIDBase) && (tab.id = "");
         tabpanel.id.includes(UIDBase) && (tabpanel.id = "");

         if (!initActive) {
            this._toggleHidden(tabpanel, false);
            TAB_ELEMS.forEach((elemName) => tabObj[elemName]?.classList.remove(opts.classes[elemName].active));
         }
         off([tab, tabpanel]);
      });

      this.isInit = false;

      this._emit(EVENT_DESTROY, this);
   }
   initTab(tab) {
      const tablist = this;
      const { tabs, opts, id, selected } = tablist;

      const index = tabs.length;
      let tabpanel = document.getElementById(tab.dataset.tablistTab);

      if (!tabpanel && opts.siblingPanel) {
         tabpanel = tab.nextElementSibling;
         tabpanel.id ||= `${id}-${TABPANEL}-${index}`;
      }
      if (!tabpanel) return;

      let item = tab.closest(opts.selectors[ITEM]);

      tab.id ||= `${id}-${TAB}-${index}`;

      attr(tab, {
         [ARIA_CONTROLS]: tabpanel.id,
         [ARIA_LABELLEDBY]: tab.id,
      });
      if (opts.roles) {
         attr(tab, ROLE, opts.roles[TAB]);
         attr(tabpanel, ROLE, opts.roles[TABPANEL]);
         attr(item, ROLE, opts.roles[ITEM]);
      }

      let isActive = opts.classes[TABPANEL].active.split(" ").every((c) => tabpanel.classList.contains(c));

      if (selected.length && !opts.multiExpand) {
         isActive = false;
      }
      if (opts.hashOpen && window.location.hash.substring(1) == tabpanel.id) {
         isActive = true;
      }

      on(tab, EVENT_FOCUS, this[ON_TAB_FOCUS]);
      on(tab, EVENT_KEY_DOWN, this[ON_TAB_KEYDOWN]);
      on(tab, EVENT_CLICK, this[ON_TAB_CLICK]);
      on(tabpanel, EVENT_CLICK, this[ON_TABPANEL_CLICK]);

      const tabObj = {
         tab,
         item,
         tabpanel,
         elems: [tab, item, tabpanel],
         index,
         tablist,
         isActive,
         states: [STATE_CLOSED],
         animations: [],
         promises: new Set(),
      };
      ["toggle", "open", "close"].forEach((action) => (tabObj[action] = tablist[action].bind(tablist, tabObj)));

      tabs.push(tabObj);

      toggleElemDisabled(tab, isElemDisabled(tab));

      tabObj.toggle(isActive);
      // this.toggle(tabObj, isActive);

      tabObj.isInit = true;
   }
   getFocusableNodes(tabpanel) {
      return getElements(this.opts.focusableElements, tabpanel).filter(({ offsetWidth }) => offsetWidth);
   }
   setFocusToFirstNode({ tabpanel }) {
      // if (this.opts.focusTrapping) {
      //    this._on(BODY, EVENT_FOCUS_IN);
      // }

      // if (this.opts.focusTrapping) {
      //    tabObj[ON_BODY_FOCUS_IN] = this[ON_BODY_FOCUS_IN].bind(this, tabObj);
      //    document.body.addEventListener(EVENT_FOCUS_IN, tabObj[ON_BODY_FOCUS_IN]);
      // }

      let elem = getElement("[autofocus]", tabpanel);
      if (this.opts.dataAutofocus) {
         elem = getElement(AUTOFOCUS, tabpanel) || elem;
      }
      elem ||= this.getFocusableNodes(tabpanel)[0];
      focus(elem);
   }
   // [ON_BODY_FOCUS_IN]({ tabpanel }) {
   //    if (!tabpanel.contains(document.activeElement)) {
   //       focus(this.getFocusableNodes(tabpanel)[0]);
   //    }
   // }

   returnFocus(tabObj) {
      if (this.opts.closeOnClickAway) {
         off(document.body);
      }
      // if (this.opts.focusTrapping) {
      //    document.body.removeEventListener(EVENT_FOCUS_IN, tabObj[ON_BODY_FOCUS_IN]);
      //    tabObj[ON_BODY_FOCUS_IN] = null;
      // }
      if (this.opts.returnFocusAfterHide) {
         focus(tabObj.tab);
      }
   }

   _toggleHidden(tabpanel, s) {
      this.opts.useHiddenAttribute && (tabpanel.hidden = !!s);
   }
   getTabByElem(elem) {
      return this.tabs.find(({ elems }) => elems.includes(elem));
   }

   _updateElemClasses({ tabpanel, states, animations }) {
      updateStateClasses.call(this, { elem: tabpanel, elemName: TABPANEL, states: { states, animations }, STATES });
   }
   [ON_TAB_CLICK](e) {
      e.preventDefault();
      this.toggle(this.getTabByElem(e.currentTarget));
   }

   [ON_TABLIST_FOCUS_OUT]() {
      this._updateTabindex();
   }
   async [ON_TABPANEL_CLICK](e) {
      let closeElem = e.target.closest(this.opts.selectors.close);
      if (closeElem) {
         let tabObj = this.getTabByElem(closeElem.closest(this.opts.selectors[TABPANEL]));
         if (!tabObj) return;
         e.preventDefault();
         await tabObj.close();
         if (this.opts.returnFocusAfterHide) {
            focus(tabObj.tab);
         }
      }
   }
   [ON_TAB_FOCUS]({ currentTarget }) {
      const tabObj = this.getTabByElem(currentTarget);
      if (isElemDisabled(tabObj.tab)) {
         return;
      }
      this.currentTabIndex = this.tabs.indexOf(tabObj);
   }

   [ON_TAB_KEYDOWN](e) {
      const tabObj = this.getTabByElem(e.currentTarget);
      const currentIndex = this.tabs.indexOf(tabObj);

      if ([32, 13].includes(e.keyCode) && !["BUTTON", "A"].includes(tabObj.tab.nodeName)) {
         return tabObj.toggle();
      }
      if (35 > e.keyCode || 40 < e.keyCode || !this.opts.keyboardNavigation) {
         return;
      }

      e.preventDefault();

      const rtl = this.opts.rtl;
      let firstIndex = this.firstActiveTabIndex;
      let lastIndex = this.lastActiveTabIndex;
      let nextIndex = currentIndex + 1;
      let prevIndex = currentIndex ? currentIndex - 1 : lastIndex;

      switch (e.keyCode) {
         case 35:
            this._switchTab(rtl ? firstIndex : lastIndex);
            break;
         case 36:
            this._switchTab(rtl ? lastIndex : firstIndex);
            break;
         case 37:
         case 38:
            this._switchTab(rtl ? nextIndex : prevIndex);
            break;
         case 39:
         case 40:
            this._switchTab(rtl ? prevIndex : nextIndex);
            break;
      }
   }
   _switchTab(index) {
      const tabs = this.tabs;
      if (tabs[index] && isElemDisabled(tabs[index].tab)) {
         this._switchTab(index > this.currentTabIndex ? index + 1 : index - 1);
         return;
      }
      this.currentTabIndex = index < this.firstActiveTabIndex ? this.lastActiveTabIndex : index >= tabs.length ? this.firstActiveTabIndex : index;

      let tabObj = tabs[this.currentTabIndex];
      this.opts.arrowActivation && !tabObj.isActive && tabObj.open();
      focus(tabObj.tab);
   }
   _updateTabindex() {
      if (!this.opts.keyboardNavigation) return;
      let active = this.selected[0]?.index ?? this.firstActiveTabIndex;
      this.tabs.forEach(({ tab }, i) => {
         tab.setAttribute(tab, TABINDEX, i == active ? 0 : -1);
      });
   }
   get selected() {
      return this.tabs.filter(({ isActive }) => isActive);
   }
   get firstActiveTabIndex() {
      return this.tabs.find(({ tab }) => !isElemDisabled(tab))?.index;
   }
   get lastActiveTabIndex() {
      return this.tabs.filter(({ tab }) => !isElemDisabled(tab)).pop()?.index;
   }
   _checkAnimation(eventName = this.getCustomEventName(eventName), tabObj) {
      let promises = tabObj.promises;
      collectAnimations.call(this, { elem: tabObj.tabpanel, promises, eventName });
      if (promises.size) {
         // tabObj.isAwaiting = true;
         return Promise.allSettled(promises.values()).then(() => promises.clear());
      }
   }
   open(tabObj, opts) {
      return this.toggle(tabObj, 1, opts);
   }
   close(tabObj, opts) {
      return this.toggle(tabObj, 0, opts);
   }
   async toggle(tabObj, s, { silent } = {}) {
      if (!tabObj) return;
      const opts = this.opts;
      const { tab, tabpanel, isActive, isInit } = tabObj;

      s = !!(s ?? !isActive);

      if (opts.awaiteTabpanelAnimation && tabObj.promises.size && ((this.selected.length <= 1 && !opts.multiExpand) || opts.multiExpand)) return;
      if (!opts.allowAllClosed && !s && this.selected.length <= 1 && isActive) return;
      if (s && isElemDisabled(tab)) return;

      tabObj.isActive = s;

      if (s) {
         this.prevTabObj = tabObj;
      } else {
         if (!this.selected.length) {
            isInit && this.returnFocus(tabObj);
         }
      }
      this._emit(s ? EVENT_BEFORE_OPEN : EVENT_BEFORE_CLOSE);

      if (!opts.multiExpand && s) {
         for (let selectedTab of this.selected) {
            if (tabObj !== selectedTab && selectedTab.isActive) {
               if (opts.awaitePreviousTabpanel) {
                  await selectedTab.close();
               } else {
                  selectedTab.close();
               }
            }
         }
      }

      if (s && !tabObj.isActive) return; // If the opening was canceled

      attr(tab, ARIA_SELECTED, s);
      attr(tabpanel, {
         [ARIA_HIDDEN]: !s,
         [ARIA_EXPANDED]: s,
      });

      tabObj.states = [];
      tabObj.animations = [s ? STATE_TRANSITION_ENTER_FROM : STATE_TRANSITION_LEAVE_FROM];
      this._updateElemClasses(tabObj);

      if ((!isInit && !s) || s) {
         this._toggleHidden(tabpanel, !s);
      }

      tabpanel.offsetWidth;

      if (!this.selected.length) {
         this._setHeightGroup(0);
      }

      this._setHeightTabpanel(tabpanel);

      if (this.isInit) {
         tabObj.states = [s ? STATE_OPEN : STATE_CLOSE];
         tabObj.animations = [s ? STATE_TRANSITION_ENTER_ACTIVE : STATE_TRANSITION_LEAVE_ACTIVE, s ? STATE_TRANSITION_ENTER_TO : STATE_TRANSITION_LEAVE_TO];
         this._updateElemClasses(tabObj);
      }

      TAB_ELEMS.forEach((elemName) => {
         toggleClass(tabObj[elemName], this.opts.classes[elemName].active, s);
      });
      !silent && this._emit(s ? EVENT_OPEN : EVENT_CLOSE, tabObj);

      // catch DOMException: The user aborted a request.
      // try {
      await this._checkAnimation(s ? EVENT_OPEN : EVENT_CLOSE, tabObj);
      // } catch (e) {}

      if (s) {
         if (opts.closeOnClickAway) {
            on(document.body, EVENT_CLICK, ({ target }) => {
               if (!tabpanel.contains(target) && !tab.contains(target)) {
                  tabObj.close();
               }
            });
         }
         if (opts.autofocus) {
            if ((!isInit && opts.autofocusInit) || isInit) {
               this.setFocusToFirstNode(tabObj);
            }
         }
         if (opts.closeOnEscape) {
            on(tabObj.elems, EVENT_KEY_DOWN_ESCAPE, (e) => {
               if (e.key === "Escape") {
                  this.opts.escapeStopPropagation && e.stopPropagation();
                  tabObj.close();
                  this.returnFocus(tabObj);
               }
            });
         }
      } else {
         if (opts.closeOnEscape) {
            off(tabObj.elems, EVENT_KEY_DOWN_ESCAPE);
         }
      }

      this._toggleHidden(tabpanel, !s);

      // tabObj.isAwaiting = false;

      tabObj.states = [s ? STATE_OPENED : STATE_CLOSED];
      tabObj.animations = [];
      this._updateElemClasses(tabObj);
      !silent && this._emit(s ? EVENT_OPENED : EVENT_CLOSED, tabObj);
   }
   _setHeightGroup(height) {
      this.tabpanelsGroup?.style.setProperty("--height", height + "px");
   }
   _setHeightTabpanel(tabpanel, height = tabpanel.scrollHeight) {
      tabpanel.style.setProperty("--height", height + "px");
      this._setHeightGroup(height);
   }
   toggleAll(s, opts) {
      this.tabs.forEach((tabObj) => tabObj.toggle(s, opts));
   }
   closeAll(opts) {
      this.toggleAll(0, opts);
   }
   openAll(opts) {
      this.toggleAll(1, opts);
   }
}

export default Tablist;
